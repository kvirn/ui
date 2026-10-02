import { describe, expect, test } from 'vite-plus/test'
import { createFileUpload } from './file-upload.ts'
import type { FileUploadContext, FileUploadEnv, FileUploadOptions } from './file-upload-types.ts'

/** Object URLs without a browser: remembers what was made and revoked. */
function createFakeEnv() {
  let counter = 0
  const created: string[] = []
  const revoked: string[] = []
  const env: FileUploadEnv = {
    window: {
      URL: {
        createObjectURL: () => {
          counter += 1
          const url = `blob:fake/${counter}`
          created.push(url)
          return url
        },
        revokeObjectURL: (url) => {
          revoked.push(url)
        },
      },
    },
  }
  return { env, created, revoked }
}

interface Call {
  file: File
  context: FileUploadContext
  resolve: (result: string) => void
  reject: (cause: unknown) => void
}

/** An `upload` the test settles by hand, so ordering is exact. */
function createFakeUpload() {
  const calls: Call[] = []
  const upload = (file: File, context: FileUploadContext) =>
    new Promise<string>((resolve, reject) => {
      calls.push({ file, context, resolve, reject })
    })
  return { calls, upload, names: () => calls.map((call) => call.file.name) }
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

const make = (name: string, type = 'application/pdf', content = 'x') =>
  new File([content], name, { type })

function setup(options: FileUploadOptions<string> = {}, env = createFakeEnv()) {
  const fake = createFakeUpload()
  const store = createFileUpload<string>({ upload: fake.upload, ...options }, env.env)
  const statuses = () => store.getState().items.map((item) => `${item.file.name}:${item.status}`)
  return { store, fake, env, statuses }
}

describe('add: checks and reasons', () => {
  test('a file that passes is a pending item with no error, progress or preview', () => {
    const { store } = setup({ autoUpload: false })
    const { accepted, rejected } = store.actions.add([make('a.pdf')])
    expect(rejected).toEqual([])
    expect(accepted).toHaveLength(1)
    expect(store.getState().items[0]).toMatchObject({
      status: 'pending',
      progress: undefined,
      error: undefined,
      result: undefined,
      previewUrl: undefined,
    })
    expect(store.getState().items[0]?.file.name).toBe('a.pdf')
  })

  test('accept: a wrong type is rejected with the allowed list', () => {
    const { store } = setup({ accept: '.pdf,image/*' })
    const { rejected } = store.actions.add([make('a.docx', 'application/msword')])
    expect(rejected[0]?.reason).toEqual({ kind: 'type', allowed: ['.pdf', 'image/*'] })
  })

  test('accept matches by extension, wildcard and MIME type in any case', () => {
    const { store } = setup({ accept: '.PDF, Image/*', autoUpload: false })
    const { accepted, rejected } = store.actions.add([
      make('SCAN.pdf', ''),
      make('photo', 'IMAGE/PNG'),
      make('notes.txt', 'text/plain'),
    ])
    expect(accepted.map((item) => item.file.name)).toEqual(['SCAN.pdf', 'photo'])
    expect(rejected.map((item) => item.file.name)).toEqual(['notes.txt'])
  })

  test('maxFileSize: a larger file is rejected as tooLarge with the limit', () => {
    const { store } = setup({ maxFileSize: 3 })
    const { accepted, rejected } = store.actions.add([
      make('ok.pdf', 'application/pdf', 'abc'),
      make('big.pdf', 'application/pdf', 'abcd'),
    ])
    expect(accepted).toHaveLength(1)
    expect(rejected[0]?.reason).toEqual({ kind: 'tooLarge', limit: 3 })
  })

  test('minFileSize: a smaller file is rejected as tooSmall with the limit', () => {
    const { store } = setup({ minFileSize: 2 })
    const { accepted, rejected } = store.actions.add([
      make('tiny.pdf', 'application/pdf', 'a'),
      make('ok.pdf', 'application/pdf', 'ab'),
    ])
    expect(accepted.map((item) => item.file.name)).toEqual(['ok.pdf'])
    expect(rejected[0]?.reason).toEqual({ kind: 'tooSmall', limit: 2 })
  })

  test('validate: a message rejects as custom, nothing accepts', () => {
    const { store } = setup({
      validate: (file) => (file.name.startsWith('x') ? 'Starts with x' : undefined),
    })
    const { accepted, rejected } = store.actions.add([make('xa.pdf'), make('ya.pdf')])
    expect(accepted.map((item) => item.file.name)).toEqual(['ya.pdf'])
    expect(rejected[0]?.reason).toEqual({ kind: 'custom', message: 'Starts with x' })
  })

  test('maxFiles: files over the limit are rejected as tooMany, in the order given', () => {
    const { store } = setup({ maxFiles: 2, autoUpload: false })
    const { accepted, rejected } = store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf')])
    expect(accepted.map((item) => item.file.name)).toEqual(['1.pdf', '2.pdf'])
    expect(rejected.map((item) => item.file.name)).toEqual(['3.pdf'])
    expect(rejected[0]?.reason).toEqual({ kind: 'tooMany', maxFiles: 2 })
  })

  test('maxFiles counts the files already in the list, across selections', () => {
    const { store } = setup({ maxFiles: 3, autoUpload: false })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    const { accepted, rejected } = store.actions.add([make('3.pdf'), make('4.pdf')])
    expect(accepted.map((item) => item.file.name)).toEqual(['3.pdf'])
    expect(rejected.map((item) => item.file.name)).toEqual(['4.pdf'])
  })

  test('maxFiles does not count rejected files, so a refused file never takes a slot', () => {
    const { store } = setup({ maxFiles: 1, accept: '.pdf', autoUpload: false })
    store.actions.add([make('bad.exe', 'application/x-msdownload')])
    expect(store.getState().items).toHaveLength(0)
    const { accepted } = store.actions.add([make('good.pdf')])
    expect(accepted).toHaveLength(1)
  })

  test('maxFiles counts uploaded, failed and cancelled items, and frees a slot on remove', async () => {
    const { store, fake } = setup({ maxFiles: 2, concurrency: 1 })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    fake.calls[0]?.resolve('one')
    await flush()
    expect(store.actions.add([make('3.pdf')]).rejected).toHaveLength(1)
    store.actions.remove(store.getState().items[0]?.id ?? '')
    expect(store.actions.add([make('4.pdf')]).accepted).toHaveLength(1)
  })

  test('a file that fails a check other than the room is not told it is too many', () => {
    const { store } = setup({ maxFiles: 1, accept: '.pdf', autoUpload: false })
    store.actions.add([make('1.pdf')])
    const { rejected } = store.actions.add([make('2.exe', 'application/x-msdownload')])
    expect(rejected[0]?.reason.kind).toBe('type')
  })

  test('a rejected file is never in the list, never uploaded and never gets a preview', () => {
    const { store, fake, env } = setup({ accept: '.pdf', previews: true })
    store.actions.add([make('photo.png', 'image/png')])
    expect(store.getState().items).toEqual([])
    expect(fake.calls).toHaveLength(0)
    expect(env.created).toEqual([])
  })

  test('no item ever has the status rejected, and a rejected file carries the File itself', () => {
    const { store } = setup({ accept: '.pdf', autoUpload: false })
    const bad = make('bad.exe', '')
    const { rejected } = store.actions.add([make('1.pdf'), bad])
    expect(rejected).toEqual([{ file: bad, reason: { kind: 'type', allowed: ['.pdf'] } }])
    expect(store.getState().items.map((item) => item.status as string)).toEqual(['pending'])
  })

  test('an empty selection changes nothing', () => {
    const { store } = setup()
    let notifications = 0
    store.subscribe(() => {
      notifications += 1
    })
    expect(store.actions.add([])).toEqual({ accepted: [], rejected: [] })
    expect(notifications).toBe(0)
  })

  test('takes anything array-like, such as a FileList', () => {
    const { store } = setup({ autoUpload: false })
    const first = make('1.pdf')
    const second = make('2.pdf')
    const { accepted } = store.actions.add({ 0: first, 1: second, length: 2 })
    expect(accepted.map((item) => item.file)).toEqual([first, second])
  })

  test('limits are read when files are added, so a changed option applies (an options function)', () => {
    let maxFiles = 1
    const store = createFileUpload<string>(() => ({ maxFiles, autoUpload: false }), undefined)
    expect(store.actions.add([make('1.pdf'), make('2.pdf')]).accepted).toHaveLength(1)
    maxFiles = 3
    expect(store.actions.add([make('3.pdf'), make('4.pdf')]).accepted).toHaveLength(2)
  })
})

describe('add: appending and duplicates', () => {
  test('a second selection appends and never replaces the first', () => {
    const { store } = setup({ autoUpload: false })
    store.actions.add([make('1.pdf')])
    store.actions.add([make('2.pdf'), make('3.pdf')])
    expect(store.getState().items.map((item) => item.file.name)).toEqual([
      '1.pdf',
      '2.pdf',
      '3.pdf',
    ])
  })

  test('the same file selected twice is rejected as a duplicate, so it is one item', () => {
    const { store } = setup({ autoUpload: false })
    const file = make('same.pdf')
    store.actions.add([file])
    const { accepted, rejected } = store.actions.add([file])
    expect(accepted).toEqual([])
    expect(rejected).toEqual([{ file, reason: { kind: 'duplicate' } }])
    expect(store.getState().items).toHaveLength(1)
  })

  test('ids are unique across the store’s life, also after a removal', () => {
    const { store } = setup({ autoUpload: false })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    const removedId = store.getState().items[0]?.id ?? ''
    store.actions.remove(removedId)
    store.actions.add([make('3.pdf')])
    const ids = store.getState().items.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).not.toContain(removedId)
  })

  test('rejected files are left out, and the accepted ones keep the order given', () => {
    const { store } = setup({ accept: '.pdf', autoUpload: false })
    store.actions.add([make('1.pdf'), make('2.exe', ''), make('3.pdf')])
    expect(store.getState().items.map((item) => `${item.file.name}:${item.status}`)).toEqual([
      '1.pdf:pending',
      '3.pdf:pending',
    ])
  })

  test('subscribers are told when the list changes', () => {
    const { store } = setup({ autoUpload: false })
    let notifications = 0
    const unsubscribe = store.subscribe(() => {
      notifications += 1
    })
    store.actions.add([make('1.pdf')])
    expect(notifications).toBeGreaterThan(0)
    unsubscribe()
    const before = notifications
    store.actions.add([make('2.pdf')])
    expect(notifications).toBe(before)
  })
})

describe('upload queue', () => {
  test('autoUpload (default) starts uploads as files are added', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    expect(fake.names()).toEqual(['1.pdf'])
    expect(store.getState().items[0]?.status).toBe('uploading')
  })

  test('at most `concurrency` uploads run at once (default 3), the rest wait as pending', () => {
    const { store, fake, statuses } = setup()
    store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf'), make('4.pdf'), make('5.pdf')])
    expect(fake.names()).toEqual(['1.pdf', '2.pdf', '3.pdf'])
    expect(statuses()).toEqual([
      '1.pdf:uploading',
      '2.pdf:uploading',
      '3.pdf:uploading',
      '4.pdf:pending',
      '5.pdf:pending',
    ])
  })

  test('a finished upload frees a slot, and the next waiting file starts, in the order added', async () => {
    const { store, fake, statuses } = setup({ concurrency: 2 })
    store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf'), make('4.pdf')])
    expect(fake.names()).toEqual(['1.pdf', '2.pdf'])

    fake.calls[1]?.resolve('two')
    await flush()
    expect(fake.names()).toEqual(['1.pdf', '2.pdf', '3.pdf'])

    fake.calls[0]?.resolve('one')
    await flush()
    expect(fake.names()).toEqual(['1.pdf', '2.pdf', '3.pdf', '4.pdf'])
    expect(statuses()).toEqual([
      '1.pdf:complete',
      '2.pdf:complete',
      '3.pdf:uploading',
      '4.pdf:uploading',
    ])
  })

  test('a later selection queues behind the files already waiting', () => {
    const { store, fake } = setup({ concurrency: 1 })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    store.actions.add([make('3.pdf')])
    expect(fake.names()).toEqual(['1.pdf'])
    fake.calls[0]?.resolve('one')
    return flush().then(() => {
      expect(fake.names()).toEqual(['1.pdf', '2.pdf'])
    })
  })

  test('a failed upload frees its slot too', async () => {
    const { store, fake } = setup({ concurrency: 1 })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    fake.calls[0]?.reject(new Error('network'))
    await flush()
    expect(fake.names()).toEqual(['1.pdf', '2.pdf'])
  })

  test('concurrency below 1 or not a number is treated as 1', () => {
    for (const concurrency of [0, -2, Number.NaN]) {
      const { store, fake } = setup({ concurrency })
      store.actions.add([make('1.pdf'), make('2.pdf')])
      expect(fake.names()).toEqual(['1.pdf'])
    }
  })

  test('concurrency can be read again later (an options function)', async () => {
    let concurrency = 1
    const fake = createFakeUpload()
    const store = createFileUpload<string>(() => ({ upload: fake.upload, concurrency }), undefined)
    store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf')])
    expect(fake.names()).toEqual(['1.pdf'])
    concurrency = 3
    fake.calls[0]?.resolve('one')
    await flush()
    expect(fake.names()).toEqual(['1.pdf', '2.pdf', '3.pdf'])
  })

  test('autoUpload={false} leaves files pending until uploadAll()', () => {
    const { store, fake, statuses } = setup({ autoUpload: false, concurrency: 2 })
    store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf')])
    expect(fake.calls).toHaveLength(0)
    expect(statuses()).toEqual(['1.pdf:pending', '2.pdf:pending', '3.pdf:pending'])

    store.actions.uploadAll()
    expect(fake.names()).toEqual(['1.pdf', '2.pdf'])
    expect(statuses()).toEqual(['1.pdf:uploading', '2.pdf:uploading', '3.pdf:pending'])
  })

  test('uploadAll() skips running and finished items, and calling it twice starts nothing twice', async () => {
    const { store, fake, statuses } = setup({ autoUpload: false, accept: '.pdf' })
    store.actions.add([make('1.pdf'), make('2.exe', ''), make('3.pdf')])
    store.actions.uploadAll()
    store.actions.uploadAll()
    expect(fake.names()).toEqual(['1.pdf', '3.pdf'])
    fake.calls[0]?.resolve('one')
    await flush()
    store.actions.uploadAll()
    expect(fake.names()).toEqual(['1.pdf', '3.pdf'])
    expect(statuses()).toEqual(['1.pdf:complete', '3.pdf:uploading'])
  })

  test('files added after uploadAll() stay pending while autoUpload is off', () => {
    const { store, fake } = setup({ autoUpload: false })
    store.actions.uploadAll()
    store.actions.add([make('1.pdf')])
    expect(fake.calls).toHaveLength(0)
  })

  test('without an upload function, files stay pending and uploadAll() does nothing', () => {
    const store = createFileUpload<string>({}, undefined)
    store.actions.add([make('1.pdf')])
    store.actions.uploadAll()
    expect(store.getState().items[0]?.status).toBe('pending')
  })

  test('a resolved upload is complete, with progress 1 and the result on the item', async () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.resolve('server-id-7')
    await flush()
    expect(store.getState().items[0]).toMatchObject({
      status: 'complete',
      result: 'server-id-7',
      progress: 100,
      error: undefined,
    })
  })

  test('a rejected upload is failed, with the cause as a typed error', async () => {
    const { store, fake } = setup()
    const cause = new Error('413')
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.reject(cause)
    await flush()
    expect(store.getState().items[0]).toMatchObject({
      status: 'failed',
      error: { kind: 'uploadFailed', cause, retryable: true, message: undefined },
      result: undefined,
    })
  })

  test('an upload function that throws before returning a promise is failed, not an exception', async () => {
    const store = createFileUpload<string>(
      {
        upload: () => {
          throw new Error('sync')
        },
      },
      undefined,
    )
    expect(() => store.actions.add([make('1.pdf')])).not.toThrow()
    await flush()
    expect(store.getState().items[0]?.status).toBe('failed')
  })

  test('progress starts unknown, then follows onProgress as whole percent, clamped to 0..100', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    expect(store.getState().items[0]?.progress).toBeUndefined()
    fake.calls[0]?.context.onProgress(0.4)
    expect(store.getState().items[0]?.progress).toBe(40)
    fake.calls[0]?.context.onProgress(7)
    expect(store.getState().items[0]?.progress).toBe(100)
    fake.calls[0]?.context.onProgress(-1)
    expect(store.getState().items[0]?.progress).toBe(0)
    fake.calls[0]?.context.onProgress(Number.NaN)
    expect(store.getState().items[0]?.progress).toBe(0)
  })

  test('progress is rounded to a whole percent', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.context.onProgress(0.4549)
    expect(store.getState().items[0]?.progress).toBe(45)
    fake.calls[0]?.context.onProgress(0.456)
    expect(store.getState().items[0]?.progress).toBe(46)
    fake.calls[0]?.context.onProgress(0.004)
    expect(store.getState().items[0]?.progress).toBe(0)
    fake.calls[0]?.context.onProgress(0.996)
    expect(Number.isInteger(store.getState().items[0]?.progress)).toBe(true)
    expect(store.getState().items[0]?.progress).toBe(100)
  })

  test('progress notifies at most once per whole percent, so assistive tech sees at most 100 changes', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    let notifications = 0
    store.subscribe(() => {
      notifications += 1
    })
    for (let step = 0; step <= 10000; step += 1) {
      fake.calls[0]?.context.onProgress(step / 10000)
    }
    expect(store.getState().items[0]?.progress).toBe(100)
    expect(notifications).toBeLessThanOrEqual(101)
  })

  test('the same percent again does not notify', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.context.onProgress(0.5)
    let notifications = 0
    store.subscribe(() => {
      notifications += 1
    })
    fake.calls[0]?.context.onProgress(0.501)
    expect(notifications).toBe(0)
  })

  test('indeterminate stays undefined until the upload reports progress', async () => {
    const { store } = setup()
    store.actions.add([make('1.pdf')])
    await flush()
    expect(store.getState().items[0]?.progress).toBeUndefined()
  })

  test('there is no timeout: a slow upload stays uploading', async () => {
    const { store } = setup()
    store.actions.add([make('1.pdf')])
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(store.getState().items[0]?.status).toBe('uploading')
  })

  test('the upload gets an AbortSignal that is not aborted while it runs', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    expect(fake.calls[0]?.context.signal.aborted).toBe(false)
  })
})

describe('cancel', () => {
  test('aborts the signal and the item is cancelled at once, keeping its progress', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.context.onProgress(0.5)
    store.actions.cancel(store.getState().items[0]?.id ?? '')
    expect(fake.calls[0]?.context.signal.aborted).toBe(true)
    expect(store.getState().items[0]).toMatchObject({
      status: 'cancelled',
      progress: 50,
      error: undefined,
    })
  })

  test('cancelling frees the slot at once, so the next waiting file starts', () => {
    const { store, fake } = setup({ concurrency: 1 })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    store.actions.cancel(store.getState().items[0]?.id ?? '')
    expect(fake.names()).toEqual(['1.pdf', '2.pdf'])
  })

  test('the upload settling afterwards, resolved or rejected, does not change a cancelled item', async () => {
    const { store, fake } = setup({ concurrency: 2 })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    store.actions.cancel(store.getState().items[0]?.id ?? '')
    store.actions.cancel(store.getState().items[1]?.id ?? '')
    fake.calls[0]?.resolve('late')
    fake.calls[1]?.reject(new DOMException('Aborted', 'AbortError'))
    await flush()
    expect(store.getState().items.map((item) => item.status)).toEqual(['cancelled', 'cancelled'])
    expect(store.getState().items[0]?.result).toBeUndefined()
  })

  test('progress reported after a cancel is ignored', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    store.actions.cancel(store.getState().items[0]?.id ?? '')
    fake.calls[0]?.context.onProgress(0.9)
    expect(store.getState().items[0]?.progress).toBeUndefined()
  })

  test('a file waiting for a slot can be cancelled, and then never starts', async () => {
    const { store, fake, statuses } = setup({ concurrency: 1 })
    store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf')])
    store.actions.cancel(store.getState().items[1]?.id ?? '')
    expect(statuses()).toEqual(['1.pdf:uploading', '2.pdf:cancelled', '3.pdf:pending'])
    fake.calls[0]?.resolve('one')
    await flush()
    expect(fake.names()).toEqual(['1.pdf', '3.pdf'])
  })

  test('does nothing for a finished, failed, pending-for-the-form or unknown item', async () => {
    const { store, fake } = setup({ accept: '.pdf', concurrency: 5 })
    store.actions.add([make('done.pdf'), make('fail.pdf'), make('bad.exe', '')])
    fake.calls[0]?.resolve('ok')
    fake.calls[1]?.reject(new Error('x'))
    await flush()
    const before = store.getState().items
    for (const item of before) {
      store.actions.cancel(item.id)
    }
    store.actions.cancel('nope')
    expect(store.getState().items).toEqual(before)

    const form = createFileUpload<string>({}, undefined)
    form.actions.add([make('1.pdf')])
    form.actions.cancel(form.getState().items[0]?.id ?? '')
    expect(form.getState().items[0]?.status).toBe('pending')
  })
})

describe('retry', () => {
  test('a failed item goes pending, loses its error and uploads again', async () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.reject(new Error('x'))
    await flush()
    store.actions.retry(store.getState().items[0]?.id ?? '')
    expect(fake.calls).toHaveLength(2)
    expect(store.getState().items[0]).toMatchObject({
      status: 'uploading',
      error: undefined,
      progress: undefined,
    })
    fake.calls[1]?.resolve('second try')
    await flush()
    expect(store.getState().items[0]).toMatchObject({ status: 'complete', result: 'second try' })
  })

  test('a cancelled item can be retried, with a fresh, not aborted signal', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    store.actions.cancel(store.getState().items[0]?.id ?? '')
    store.actions.retry(store.getState().items[0]?.id ?? '')
    expect(fake.calls).toHaveLength(2)
    expect(fake.calls[1]?.context.signal.aborted).toBe(false)
    expect(store.getState().items[0]?.status).toBe('uploading')
  })

  test('a retried item waits for a free slot like any other, behind files already waiting', async () => {
    const { store, fake, statuses } = setup({ concurrency: 1 })
    store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf')])
    fake.calls[0]?.reject(new Error('x'))
    await flush()
    // 2.pdf is uploading, 3.pdf waits. Retrying 1.pdf queues it after 3.pdf.
    store.actions.retry(store.getState().items[0]?.id ?? '')
    expect(statuses()).toEqual(['1.pdf:pending', '2.pdf:uploading', '3.pdf:pending'])
    fake.calls[1]?.resolve('two')
    await flush()
    expect(fake.names()).toEqual(['1.pdf', '2.pdf', '3.pdf'])
  })

  test('retries even when autoUpload is off, because the user asked', async () => {
    const { store, fake } = setup({ autoUpload: false })
    store.actions.add([make('1.pdf')])
    store.actions.uploadAll()
    fake.calls[0]?.reject(new Error('x'))
    await flush()
    store.actions.retry(store.getState().items[0]?.id ?? '')
    expect(fake.calls).toHaveLength(2)
  })

  test('does nothing for pending, uploading, complete or unknown items', async () => {
    const { store, fake } = setup({ accept: '.pdf', concurrency: 1 })
    store.actions.add([make('run.pdf'), make('wait.pdf')])
    const before = store.getState().items
    for (const item of before) {
      store.actions.retry(item.id)
    }
    store.actions.retry('nope')
    expect(store.getState().items).toEqual(before)
    expect(fake.calls).toHaveLength(1)
    fake.calls[0]?.resolve('ok')
    await flush()
    store.actions.retry(store.getState().items[0]?.id ?? '')
    expect(store.getState().items[0]?.status).toBe('complete')
  })

  test('a rejected file can’t be retried: it was never in the list', () => {
    const { store } = setup({ maxFileSize: 0 })
    store.actions.add([make('1.pdf')])
    expect(store.getState().items).toEqual([])
    store.actions.retry('1')
    expect(store.getState().items).toEqual([])
  })
})

describe('remove', () => {
  test('removes the item and leaves the others in order', () => {
    const { store } = setup({ autoUpload: false })
    store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf')])
    store.actions.remove(store.getState().items[1]?.id ?? '')
    expect(store.getState().items.map((item) => item.file.name)).toEqual(['1.pdf', '3.pdf'])
  })

  test('removing an unknown id does nothing', () => {
    const { store } = setup({ autoUpload: false })
    store.actions.add([make('1.pdf')])
    const before = store.getState()
    store.actions.remove('nope')
    expect(store.getState()).toBe(before)
  })

  test('removing an uploading file aborts it first, and its slot goes to the next file', () => {
    const { store, fake } = setup({ concurrency: 1 })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    store.actions.remove(store.getState().items[0]?.id ?? '')
    expect(fake.calls[0]?.context.signal.aborted).toBe(true)
    expect(store.getState().items.map((item) => item.file.name)).toEqual(['2.pdf'])
    expect(fake.names()).toEqual(['1.pdf', '2.pdf'])
  })

  test('the removed upload settling later does not bring the item back or change others', async () => {
    const { store, fake } = setup({ concurrency: 2 })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    store.actions.remove(store.getState().items[0]?.id ?? '')
    fake.calls[0]?.resolve('late')
    await flush()
    expect(store.getState().items.map((item) => `${item.file.name}:${item.status}`)).toEqual([
      '2.pdf:uploading',
    ])
  })

  test('removing a file waiting for a slot means it never starts', async () => {
    const { store, fake } = setup({ concurrency: 1 })
    store.actions.add([make('1.pdf'), make('2.pdf'), make('3.pdf')])
    store.actions.remove(store.getState().items[1]?.id ?? '')
    fake.calls[0]?.resolve('one')
    await flush()
    expect(fake.names()).toEqual(['1.pdf', '3.pdf'])
  })

  test('a failed upload whose item was removed does not throw an unhandled rejection', async () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    store.actions.remove(store.getState().items[0]?.id ?? '')
    fake.calls[0]?.reject(new DOMException('Aborted', 'AbortError'))
    await flush()
    expect(store.getState().items).toEqual([])
  })
})

describe('previews and object URLs', () => {
  test('previews are off by default: no object URLs are made', () => {
    const { store, env } = setup({ autoUpload: false })
    store.actions.add([make('photo.png', 'image/png')])
    expect(env.created).toEqual([])
    expect(store.getState().items[0]?.previewUrl).toBeUndefined()
  })

  test('with previews on, an image gets an object URL and other files do not', () => {
    const { store, env } = setup({ previews: true, autoUpload: false })
    store.actions.add([make('photo.png', 'image/png'), make('a.pdf', 'application/pdf')])
    const [photo, pdf] = store.getState().items
    expect(photo?.previewUrl).toBe(env.created[0])
    expect(pdf?.previewUrl).toBeUndefined()
    expect(env.created).toHaveLength(1)
  })

  test('without an env (server rendering) there are no previews and nothing throws', () => {
    const store = createFileUpload<string>({ previews: true }, undefined)
    store.actions.add([make('photo.png', 'image/png')])
    expect(store.getState().items[0]?.previewUrl).toBeUndefined()
  })

  test('remove revokes that item’s URL and only that one', () => {
    const { store, env } = setup({ previews: true, autoUpload: false })
    store.actions.add([make('1.png', 'image/png'), make('2.png', 'image/png')])
    const [first, second] = store.getState().items
    store.actions.remove(first?.id ?? '')
    expect(env.revoked).toEqual([first?.previewUrl])
    expect(env.revoked).not.toContain(second?.previewUrl)
  })

  test('removing an uploading image cancels the upload and revokes the URL', () => {
    const { store, env, fake } = setup({ previews: true })
    store.actions.add([make('1.png', 'image/png')])
    const url = store.getState().items[0]?.previewUrl
    store.actions.remove(store.getState().items[0]?.id ?? '')
    expect(fake.calls[0]?.context.signal.aborted).toBe(true)
    expect(env.revoked).toEqual([url])
  })

  test('a cancelled item keeps its preview, so it can be retried and still shows the file', () => {
    const { store, env } = setup({ previews: true })
    store.actions.add([make('1.png', 'image/png')])
    store.actions.cancel(store.getState().items[0]?.id ?? '')
    expect(store.getState().items[0]?.previewUrl).toBe(env.created[0])
    expect(env.revoked).toEqual([])
  })

  test('reset revokes every URL, cancels every upload and empties the list', () => {
    const { store, env, fake } = setup({ previews: true, concurrency: 1 })
    store.actions.add([make('1.png', 'image/png'), make('2.png', 'image/png')])
    store.actions.setDragging(true)
    const urls = store.getState().items.map((item) => item.previewUrl)
    store.actions.reset()
    expect(store.getState()).toEqual({ items: [], rejections: [], isDragging: false })
    expect(urls).toHaveLength(2)
    expect(env.revoked).toHaveLength(2)
    expect(env.revoked).toEqual(expect.arrayContaining(urls))
    expect(fake.calls[0]?.context.signal.aborted).toBe(true)
    expect(fake.calls).toHaveLength(1)
  })

  test('reset leaves the store usable, and a late settle from before it changes nothing', async () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    store.actions.reset()
    fake.calls[0]?.resolve('late')
    await flush()
    expect(store.getState().items).toEqual([])
    store.actions.add([make('2.pdf')])
    expect(store.getState().items.map((item) => item.status)).toEqual(['uploading'])
  })

  test('reset revokes the URL of each preview exactly once', () => {
    const { store, env } = setup({ previews: true, autoUpload: false })
    store.actions.add([make('1.png', 'image/png')])
    store.actions.reset()
    store.actions.reset()
    expect(env.revoked).toHaveLength(1)
  })
})

const makeAt = (name: string, content: string, lastModified: number) =>
  new File([content], name, { type: 'application/pdf', lastModified })

/** What the adapter does for a dropped folder entry. */
const makeFolder = (name: string) =>
  Object.assign(new File([], name), { isDirectory: true as const })

describe('add: empty files, folders and duplicates', () => {
  test('an empty file is rejected as empty', () => {
    const { store } = setup({ autoUpload: false })
    const { accepted, rejected } = store.actions.add([make('note.pdf', 'application/pdf', '')])
    expect(accepted).toEqual([])
    expect(rejected[0]?.reason).toEqual({ kind: 'empty' })
    expect(store.getState().items).toEqual([])
  })

  test('an empty file is told it is empty, not too small, even with minFileSize', () => {
    const { store } = setup({ minFileSize: 5, autoUpload: false })
    const { rejected } = store.actions.add([make('note.pdf', 'application/pdf', '')])
    expect(rejected[0]?.reason).toEqual({ kind: 'empty' })
  })

  test('a folder (isDirectory) is rejected as folder, and is never uploaded', () => {
    const { store, fake } = setup()
    const folder = makeFolder('Receipts')
    const { accepted, rejected } = store.actions.add([folder, make('1.pdf')])
    expect(rejected).toEqual([{ file: folder, reason: { kind: 'folder' } }])
    expect(accepted.map((item) => item.file.name)).toEqual(['1.pdf'])
    expect(fake.names()).toEqual(['1.pdf'])
  })

  test('a folder is told it is a folder, not the wrong type or empty', () => {
    const { store } = setup({ accept: '.pdf', autoUpload: false })
    expect(store.actions.add([makeFolder('Receipts')]).rejected[0]?.reason).toEqual({
      kind: 'folder',
    })
  })

  test('a file with the same name, size and last-modified time as one in the list is a duplicate', () => {
    const { store } = setup({ autoUpload: false })
    store.actions.add([makeAt('a.pdf', 'abc', 1000)])
    const { accepted, rejected } = store.actions.add([makeAt('a.pdf', 'xyz', 1000)])
    expect(accepted).toEqual([])
    expect(rejected[0]?.reason).toEqual({ kind: 'duplicate' })
    expect(store.getState().items).toHaveLength(1)
  })

  test('a different name, size or last-modified time is not a duplicate', () => {
    const { store } = setup({ autoUpload: false })
    store.actions.add([makeAt('a.pdf', 'abc', 1000)])
    const { accepted, rejected } = store.actions.add([
      makeAt('b.pdf', 'abc', 1000),
      makeAt('a.pdf', 'abcd', 1000),
      makeAt('a.pdf', 'abc', 2000),
    ])
    expect(rejected).toEqual([])
    expect(accepted).toHaveLength(3)
  })

  test('a duplicate within one selection is rejected, and the first one is kept', () => {
    const { store } = setup({ autoUpload: false })
    const { accepted, rejected } = store.actions.add([
      makeAt('a.pdf', 'abc', 1000),
      makeAt('a.pdf', 'abc', 1000),
    ])
    expect(accepted).toHaveLength(1)
    expect(rejected[0]?.reason).toEqual({ kind: 'duplicate' })
  })

  test('a removed file is no longer a duplicate', () => {
    const { store } = setup({ autoUpload: false })
    const file = makeAt('a.pdf', 'abc', 1000)
    store.actions.add([file])
    store.actions.remove(store.getState().items[0]?.id ?? '')
    expect(store.actions.add([file]).accepted).toHaveLength(1)
  })

  test('allowDuplicates lets the same file in again', () => {
    const { store } = setup({ allowDuplicates: true, autoUpload: false })
    const file = makeAt('a.pdf', 'abc', 1000)
    store.actions.add([file])
    const { accepted, rejected } = store.actions.add([file, file])
    expect(rejected).toEqual([])
    expect(accepted).toHaveLength(2)
    const ids = store.getState().items.map((item) => item.id)
    expect(new Set(ids).size).toBe(3)
  })

  test('a duplicate is rejected before the room is checked, and takes no slot', () => {
    const { store } = setup({ maxFiles: 2, autoUpload: false })
    store.actions.add([makeAt('a.pdf', 'abc', 1000)])
    const { rejected } = store.actions.add([
      makeAt('a.pdf', 'abc', 1000),
      makeAt('b.pdf', 'abc', 1),
    ])
    expect(rejected.map((rejection) => rejection.reason.kind)).toEqual(['duplicate'])
    expect(store.getState().items).toHaveLength(2)
  })

  test('the first reason wins: size, then duplicate, then validate, then room', () => {
    const { store } = setup({
      maxFiles: 1,
      maxFileSize: 2,
      validate: (file) => (file.name === 'b.pdf' ? 'no' : undefined),
      autoUpload: false,
    })
    store.actions.add([makeAt('a.pdf', 'ab', 1000)])
    expect(store.actions.add([makeAt('a.pdf', 'abc', 1000)]).rejected[0]?.reason.kind).toBe(
      'tooLarge',
    )
    expect(store.actions.add([makeAt('a.pdf', 'ab', 1000)]).rejected[0]?.reason.kind).toBe(
      'duplicate',
    )
    expect(store.actions.add([makeAt('b.pdf', 'ab', 1000)]).rejected[0]?.reason.kind).toBe('custom')
  })
})

describe('rejections in state', () => {
  test('holds the files refused by the latest add, in the order given', () => {
    const { store } = setup({ accept: '.pdf', maxFileSize: 3, autoUpload: false })
    store.actions.add([
      make('a.exe', ''),
      make('1.pdf'),
      make('big.pdf', 'application/pdf', 'abcd'),
    ])
    expect(
      store.getState().rejections.map((rejection) => [rejection.file.name, rejection.reason.kind]),
    ).toEqual([
      ['a.exe', 'type'],
      ['big.pdf', 'tooLarge'],
    ])
  })

  test('is the same data the add returned', () => {
    const { store } = setup({ accept: '.pdf', autoUpload: false })
    const { rejected } = store.actions.add([make('a.exe', '')])
    expect(store.getState().rejections).toEqual(rejected)
  })

  test('the next add replaces it, also when that add has no rejections', () => {
    const { store } = setup({ accept: '.pdf', autoUpload: false })
    store.actions.add([make('a.exe', '')])
    expect(store.getState().rejections).toHaveLength(1)
    store.actions.add([make('b.exe', ''), make('c.exe', '')])
    expect(store.getState().rejections.map((rejection) => rejection.file.name)).toEqual([
      'b.exe',
      'c.exe',
    ])
    store.actions.add([make('1.pdf')])
    expect(store.getState().rejections).toEqual([])
  })

  test('an empty selection leaves it as it was', () => {
    const { store } = setup({ accept: '.pdf', autoUpload: false })
    store.actions.add([make('a.exe', '')])
    store.actions.add([])
    expect(store.getState().rejections).toHaveLength(1)
  })

  test('remove clears it, and an unknown id does not', () => {
    const { store } = setup({ accept: '.pdf', autoUpload: false })
    store.actions.add([make('1.pdf'), make('a.exe', '')])
    store.actions.remove('nope')
    expect(store.getState().rejections).toHaveLength(1)
    store.actions.remove(store.getState().items[0]?.id ?? '')
    expect(store.getState().rejections).toEqual([])
  })

  test('reset clears it', () => {
    const { store } = setup({ accept: '.pdf', autoUpload: false })
    store.actions.add([make('a.exe', '')])
    store.actions.reset()
    expect(store.getState().rejections).toEqual([])
  })

  test('starts empty', () => {
    expect(setup().store.getState().rejections).toEqual([])
  })

  test('cancel, retry and uploads settling leave it alone', async () => {
    const { store, fake } = setup({ accept: '.pdf' })
    store.actions.add([make('1.pdf'), make('a.exe', '')])
    store.actions.cancel(store.getState().items[0]?.id ?? '')
    store.actions.retry(store.getState().items[0]?.id ?? '')
    fake.calls[1]?.resolve('ok')
    await flush()
    expect(store.getState().rejections).toHaveLength(1)
  })
})

describe('single-file mode (multiple: false)', () => {
  test('the first file is added', () => {
    const { store } = setup({ multiple: false, autoUpload: false })
    store.actions.add([make('1.pdf')])
    expect(store.getState().items.map((item) => item.file.name)).toEqual(['1.pdf'])
  })

  test('a new file replaces the current one instead of appending', () => {
    const { store } = setup({ multiple: false, autoUpload: false })
    store.actions.add([make('1.pdf')])
    const firstId = store.getState().items[0]?.id
    const { accepted, rejected } = store.actions.add([make('2.pdf')])
    expect(rejected).toEqual([])
    expect(accepted).toHaveLength(1)
    expect(store.getState().items.map((item) => item.file.name)).toEqual(['2.pdf'])
    expect(store.getState().items[0]?.id).not.toBe(firstId)
  })

  test('replacing cancels the upload in progress and revokes its preview first', () => {
    const { store, fake, env } = setup({ multiple: false, previews: true })
    store.actions.add([make('1.png', 'image/png')])
    const firstUrl = store.getState().items[0]?.previewUrl
    store.actions.add([make('2.png', 'image/png')])
    expect(fake.calls[0]?.context.signal.aborted).toBe(true)
    expect(env.revoked).toEqual([firstUrl])
    expect(fake.names()).toEqual(['1.png', '2.png'])
    expect(store.getState().items.map((item) => `${item.file.name}:${item.status}`)).toEqual([
      '2.png:uploading',
    ])
  })

  test('the replaced upload settling later changes nothing', async () => {
    const { store, fake } = setup({ multiple: false })
    store.actions.add([make('1.pdf')])
    store.actions.add([make('2.pdf')])
    fake.calls[0]?.resolve('late')
    await flush()
    expect(store.getState().items.map((item) => `${item.file.name}:${item.status}`)).toEqual([
      '2.pdf:uploading',
    ])
    expect(store.getState().items[0]?.result).toBeUndefined()
  })

  test('replacing frees the slot of the replaced upload', () => {
    const { store, fake } = setup({ multiple: false, concurrency: 1 })
    store.actions.add([make('1.pdf')])
    store.actions.add([make('2.pdf')])
    expect(fake.names()).toEqual(['1.pdf', '2.pdf'])
  })

  test('replaces a failed, cancelled or complete file too', async () => {
    const { store, fake } = setup({ multiple: false })
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.reject(new Error('x'))
    await flush()
    store.actions.add([make('2.pdf')])
    expect(store.getState().items.map((item) => item.file.name)).toEqual(['2.pdf'])
    fake.calls[1]?.resolve('ok')
    await flush()
    store.actions.add([make('3.pdf')])
    expect(store.getState().items.map((item) => item.file.name)).toEqual(['3.pdf'])
  })

  test('maxFiles is 1: with several files, the first acceptable one is added and the rest are tooMany', () => {
    const { store } = setup({ multiple: false, accept: '.pdf', autoUpload: false })
    const { accepted, rejected } = store.actions.add([
      make('a.exe', ''),
      make('1.pdf'),
      make('2.pdf'),
    ])
    expect(accepted.map((item) => item.file.name)).toEqual(['1.pdf'])
    expect(rejected.map((rejection) => [rejection.file.name, rejection.reason])).toEqual([
      ['a.exe', { kind: 'type', allowed: ['.pdf'] }],
      ['2.pdf', { kind: 'tooMany', maxFiles: 1 }],
    ])
    expect(store.getState().items.map((item) => item.file.name)).toEqual(['1.pdf'])
  })

  test('maxFiles is ignored in single-file mode', () => {
    const { store } = setup({ multiple: false, maxFiles: 5, autoUpload: false })
    store.actions.add([make('1.pdf'), make('2.pdf')])
    expect(store.getState().items).toHaveLength(1)
    expect(store.getState().rejections[0]?.reason).toEqual({ kind: 'tooMany', maxFiles: 1 })
  })

  test('a rejected new file leaves the current one in place', () => {
    const { store, fake } = setup({ multiple: false, accept: '.pdf' })
    store.actions.add([make('1.pdf')])
    store.actions.add([make('bad.exe', '')])
    expect(fake.calls[0]?.context.signal.aborted).toBe(false)
    expect(store.getState().items.map((item) => `${item.file.name}:${item.status}`)).toEqual([
      '1.pdf:uploading',
    ])
    expect(store.getState().rejections).toHaveLength(1)
  })

  test('choosing the same file again is a duplicate and changes nothing', () => {
    const { store, fake } = setup({ multiple: false })
    const file = makeAt('a.pdf', 'abc', 1000)
    store.actions.add([file])
    const { rejected } = store.actions.add([file])
    expect(rejected[0]?.reason).toEqual({ kind: 'duplicate' })
    expect(fake.calls).toHaveLength(1)
    expect(fake.calls[0]?.context.signal.aborted).toBe(false)
  })

  test('multiple: true (the default) appends', () => {
    const { store } = setup({ multiple: true, autoUpload: false })
    store.actions.add([make('1.pdf')])
    store.actions.add([make('2.pdf')])
    expect(store.getState().items).toHaveLength(2)
  })
})

describe('failed uploads: retryable and message', () => {
  const failWith = async (cause: unknown) => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.reject(cause)
    await flush()
    return { store, fake, item: () => store.getState().items[0] }
  }

  test('a plain rejection is retryable, with no message', async () => {
    const cause = new Error('Failed to fetch')
    const { item } = await failWith(cause)
    expect(item()?.status).toBe('failed')
    expect(item()?.error).toEqual({
      kind: 'uploadFailed',
      cause,
      retryable: true,
      message: undefined,
    })
  })

  test('a rejection that is not an object is retryable, with no message', async () => {
    const { item } = await failWith('boom')
    expect(item()?.error).toEqual({
      kind: 'uploadFailed',
      cause: 'boom',
      retryable: true,
      message: undefined,
    })
  })

  test('retryable: false and a message are stored on the item error', async () => {
    const cause = {
      retryable: false,
      message: 'scan.pdf has a password. Remove it and add the file again.',
    }
    const { item } = await failWith(cause)
    expect(item()?.status).toBe('failed')
    expect(item()?.error).toEqual({
      kind: 'uploadFailed',
      cause,
      retryable: false,
      message: 'scan.pdf has a password. Remove it and add the file again.',
    })
  })

  test('an Error with retryable and message set carries them', async () => {
    const cause = Object.assign(new Error('x'), { retryable: false, message: 'Virus found.' })
    const { item } = await failWith(cause)
    expect(item()?.error).toMatchObject({ retryable: false, message: 'Virus found.' })
  })

  test('a message with retryable: true keeps the file retryable', async () => {
    const { item } = await failWith({ retryable: true, message: 'The server is busy. Try again.' })
    expect(item()?.error).toMatchObject({
      retryable: true,
      message: 'The server is busy. Try again.',
    })
  })

  test('a message alone, from a plain object, is kept and the failure is retryable', async () => {
    const { item } = await failWith({ message: 'The server is busy.' })
    expect(item()?.error).toMatchObject({ retryable: true, message: 'The server is busy.' })
  })

  test('an empty or non-string message is dropped', async () => {
    expect((await failWith({ message: '' })).item()?.error).toMatchObject({ message: undefined })
    expect((await failWith({ message: 42 })).item()?.error).toMatchObject({ message: undefined })
  })

  test('retry restarts a retryable failure', async () => {
    const { store, fake } = await failWith({ retryable: true, message: 'Busy.' })
    store.actions.retry(store.getState().items[0]?.id ?? '')
    expect(fake.calls).toHaveLength(2)
    expect(store.getState().items[0]).toMatchObject({ status: 'uploading', error: undefined })
  })

  test('retry does nothing for a permanent failure: it stays failed with its message', async () => {
    const { store, fake } = await failWith({ retryable: false, message: 'Virus found.' })
    store.actions.retry(store.getState().items[0]?.id ?? '')
    expect(fake.calls).toHaveLength(1)
    expect(store.getState().items[0]).toMatchObject({
      status: 'failed',
      error: { retryable: false, message: 'Virus found.' },
    })
  })

  test('a permanent failure can still be removed', async () => {
    const { store } = await failWith({ retryable: false, message: 'Virus found.' })
    store.actions.remove(store.getState().items[0]?.id ?? '')
    expect(store.getState().items).toEqual([])
  })

  test('a cancelled item is always retryable', () => {
    const { store, fake } = setup()
    store.actions.add([make('1.pdf')])
    store.actions.cancel(store.getState().items[0]?.id ?? '')
    store.actions.retry(store.getState().items[0]?.id ?? '')
    expect(fake.calls).toHaveLength(2)
  })

  test('an upload function that throws synchronously with a failure object is read the same way', async () => {
    const store = createFileUpload<string>(
      {
        upload: () => {
          throw Object.assign(new Error('sync'), { retryable: false, message: 'No.' })
        },
      },
      undefined,
    )
    store.actions.add([make('1.pdf')])
    await flush()
    expect(store.getState().items[0]?.error).toMatchObject({ retryable: false, message: 'No.' })
  })
})

describe('dragging', () => {
  test('setDragging sets isDragging, and starts false', () => {
    const { store } = setup()
    expect(store.getState().isDragging).toBe(false)
    store.actions.setDragging(true)
    expect(store.getState().isDragging).toBe(true)
    store.actions.setDragging(false)
    expect(store.getState().isDragging).toBe(false)
  })

  test('setting the same value again does not notify', () => {
    const { store } = setup()
    let notifications = 0
    store.subscribe(() => {
      notifications += 1
    })
    store.actions.setDragging(false)
    expect(notifications).toBe(0)
  })
})

describe('purity', () => {
  test('creating a store needs no window or document, and an upload needs no env', async () => {
    const fake = createFakeUpload()
    const store = createFileUpload<string>({ upload: fake.upload }, undefined)
    store.actions.add([make('1.pdf')])
    fake.calls[0]?.resolve('ok')
    await flush()
    expect(store.getState().items[0]?.status).toBe('complete')
  })
})
