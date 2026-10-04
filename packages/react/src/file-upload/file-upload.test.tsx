import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import type { ReactElement, ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { FileUpload } from '../index.ts'
import type { FileUploadRootProps } from '../index.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { useFileUpload } from './use-file-upload.ts'

// Contract: file-upload.a11y.md. Dragging, the theme's states, reflow and forced colours are
// covered in apps/storybook/src/components/file-upload/file-upload.e2e.ts. Component tests load
// no theme, so what is asserted is the markup, the names, the focus and the state.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  consoleWarn.mockRestore()
})

const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))

const pdf = (name = 'report.pdf', content = 'hello') =>
  new File([content], name, { type: 'application/pdf' })

function Items() {
  return (
    <FileUpload.List>
      {(item) => (
        <FileUpload.Item key={item.id} item={item}>
          <FileUpload.Name />
          <FileUpload.Status />
          <FileUpload.Progress />
          <FileUpload.ItemError />
          <FileUpload.Actions>
            <FileUpload.CancelButton />
            <FileUpload.RetryButton />
            <FileUpload.RemoveButton />
          </FileUpload.Actions>
        </FileUpload.Item>
      )}
    </FileUpload.List>
  )
}

function Example({
  label = 'Attachments',
  required,
  invalid,
  inputName,
  children,
  ...options
}: Partial<FileUploadRootProps> & {
  label?: string
  inputName?: string
  required?: boolean
  invalid?: boolean
  children?: ReactNode
}) {
  return (
    <Field.Root required={required} invalid={invalid}>
      <Field.Label>{label}</Field.Label>
      <FileUpload.Root {...options}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
          <FileUpload.DropHint />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        {inputName === undefined ? null : <FileUpload.Input name={inputName} />}
        {children ?? <Items />}
      </FileUpload.Root>
    </Field.Root>
  )
}

function fileInput(container: Element): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')
  if (input === null) {
    throw new Error('no file input')
  }
  return input
}

async function addFiles(container: Element, ...files: File[]) {
  await userEvent.upload(fileInput(container), files)
}

const png = () => new File(['x'], 'photo.png', { type: 'image/png' })

/** A Field with a description, the limits, the rejections, the summary, and an error when invalid. */
function Described({ invalid, ...options }: Partial<FileUploadRootProps> & { invalid?: boolean }) {
  return (
    <Field.Root invalid={invalid}>
      <Field.Label>Attachments</Field.Label>
      <Field.Prose>Attach your certificate.</Field.Prose>
      <FileUpload.Root {...options}>
        <FileUpload.DropZone>
          <FileUpload.Trigger />
        </FileUpload.DropZone>
        <FileUpload.Limits />
        <FileUpload.Rejections />
        <FileUpload.Summary />
        <Items />
      </FileUpload.Root>
      {invalid ? <Field.ErrorMessage>Attach a file.</Field.ErrorMessage> : null}
    </Field.Root>
  )
}

const describedClasses = [
  ['kv-file-upload-limits', 'limits'],
  ['kv-file-upload-rejections', 'rejections'],
  ['kv-file-upload-summary', 'summary'],
  ['kv-field-error-message', 'error'],
  // Last: the Limits also carries `kv-prose`, so the specific classes above must match first.
  ['kv-prose', 'description'],
] as const

/** Which part each id in the Trigger's `aria-describedby` points at, in order. */
function describedParts(container: Element): string[] {
  const trigger = container.querySelector('.kv-file-upload-trigger')
  const ids = trigger?.getAttribute('aria-describedby')?.split(' ') ?? []
  return ids.map((id) => {
    const element = document.getElementById(id)
    if (element === null) {
      return `missing:${id}`
    }
    const match = describedClasses.find(([className]) => element.classList.contains(className))
    return match === undefined ? `unknown:${id}` : match[1]
  })
}

describe('wiring: the Trigger is the one control', () => {
  test('a native button named by its own text then the Field label, with the Field control id', async () => {
    const { container } = await render(<Example multiple />)
    const trigger = page.getByRole('button', { name: /^Choose files\s+Attachments/ })
    await expect.element(trigger).toBeVisible()
    const element = trigger.element()
    expect(element.tagName).toBe('BUTTON')
    const labelledBy = element.getAttribute('aria-labelledby')?.split(' ') ?? []
    // The name points at the text span inside the button and at the Field label, never at itself.
    expect(labelledBy).toHaveLength(2)
    expect(labelledBy[0]).toBe(`${element.id}-text`)
    expect(document.getElementById(labelledBy[0] ?? '')?.textContent).toBe('Choose files')
    expect(element.contains(document.getElementById(labelledBy[0] ?? ''))).toBe(true)
    expect(labelledBy).not.toContain(element.id)
    // The Field's label points at the Trigger, so the label and an error-summary link land on it.
    expect(container.querySelector('label')?.getAttribute('for')).toBe(element.id)
  })

  test('the native input is out of the accessibility tree, never required, and named for nobody', async () => {
    const { container } = await render(<Example multiple required />)
    const input = fileInput(container)
    expect(input.getAttribute('aria-hidden')).toBe('true')
    expect(input.tabIndex).toBe(-1)
    expect(input.required).toBe(false)
    expect(input.hasAttribute('aria-required')).toBe(false)
    expect(input.multiple).toBe(true)
  })

  test('the Trigger never carries aria-required, even in a required Field', async () => {
    await render(<Example multiple required />)
    const trigger = page.getByRole('button', { name: /^Choose files/ }).element()
    expect(trigger.hasAttribute('aria-required')).toBe(false)
  })

  test('single-file mode says "Choose file" and the input is not multiple', async () => {
    const { container } = await render(<Example multiple={false} />)
    expect(fileInput(container).multiple).toBe(false)
    await expect.element(page.getByRole('button', { name: /^Choose file\s/ })).toBeVisible()
  })
})

describe('the Trigger is described, in this order', () => {
  test('empty: the Field description, then the limits', async () => {
    const { container } = await render(<Described multiple maxFiles={1} accept=".pdf" />)
    await expect.poll(() => describedParts(container)).toEqual(['description', 'limits'])
  })

  test('after a refusal: the description, the limits, then the rejections', async () => {
    const { container } = await render(<Described multiple maxFiles={2} accept=".pdf" />)
    await addFiles(container, png())
    await expect
      .poll(() => describedParts(container))
      .toEqual(['description', 'limits', 'rejections'])
  })

  test('full: the description, the limits, then the summary, and the rejections before it', async () => {
    const { container } = await render(<Described multiple maxFiles={1} accept=".pdf" />)
    await addFiles(container, pdf())
    await expect.poll(() => describedParts(container)).toEqual(['description', 'limits', 'summary'])
    await addFiles(container, png())
    await expect
      .poll(() => describedParts(container))
      .toEqual(['description', 'limits', 'rejections', 'summary'])
  })

  test('invalid: the Field’s error comes after its descriptions and before the rejections and summary', async () => {
    const { container } = await render(<Described multiple maxFiles={1} accept=".pdf" invalid />)
    await expect.poll(() => describedParts(container)).toEqual(['description', 'limits', 'error'])
    await addFiles(container, pdf())
    await addFiles(container, png())
    await expect
      .poll(() => describedParts(container))
      .toEqual(['description', 'limits', 'error', 'rejections', 'summary'])
  })
})

describe('the item buttons are described by the Status and the error', () => {
  test('Cancel is described by the Status while the file uploads', async () => {
    const upload = vi.fn<(file: File) => Promise<string>>(() => new Promise<string>(() => {}))
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('report.pdf'))
    await expect
      .element(page.getByRole('button', { name: /Cancel upload of report\.pdf/ }))
      .toHaveAccessibleDescription(/^Uploading/)
  })

  test('Retry and Remove of a failed file are described by its Status and its error', async () => {
    const upload = vi.fn<(file: File) => Promise<string>>().mockRejectedValue(new Error('network'))
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('report.pdf'))
    const description = /Upload failed.*We couldn’t upload report\.pdf/
    await expect
      .element(page.getByRole('button', { name: /Try again with report\.pdf/ }))
      .toHaveAccessibleDescription(description)
    await expect
      .element(page.getByRole('button', { name: /Remove report\.pdf/ }))
      .toHaveAccessibleDescription(description)
  })
})

describe('adding files', () => {
  test('a chosen file appears in the list with its name', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf('report.pdf'))
    await expect.element(page.getByText('report.pdf').first()).toBeVisible()
    expect(container.querySelectorAll('li[data-status]')).toHaveLength(1)
    // A list named by the Field label, also where list-style: none drops the role (1.3.1, 4.1.2).
    await expect.element(page.getByRole('list', { name: /^Attachments/ })).toBeVisible()
  })

  test('with an upload function the input is reset, so the same file can be chosen again', async () => {
    const upload = vi.fn<(file: File) => Promise<string>>(() => new Promise<string>(() => {}))
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('report.pdf'))
    expect(fileInput(container).value).toBe('')
  })

  test('without an upload function the input holds every file, so a plain form posts them', async () => {
    const { container } = await render(<Example multiple inputName="attachments" />)
    await addFiles(container, pdf('a.pdf', 'aaa'))
    await addFiles(container, pdf('b.pdf', 'bbb'))
    const files = fileInput(container).files
    expect(files?.length).toBe(2)
    expect([...(files ?? [])].map((file) => file.name)).toEqual(['a.pdf', 'b.pdf'])
  })

  test('a second selection adds to the list instead of replacing it', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf('a.pdf', 'aaa'))
    await addFiles(container, pdf('b.pdf', 'bbb'))
    expect(container.querySelectorAll('li[data-status]')).toHaveLength(2)
  })

  test('single-file mode replaces the file', async () => {
    const { container } = await render(<Example multiple={false} />)
    await addFiles(container, pdf('a.pdf', 'aaa'))
    await addFiles(container, pdf('b.pdf', 'bbb'))
    const items = container.querySelectorAll('li[data-status]')
    expect(items).toHaveLength(1)
    expect(items[0]?.textContent).toContain('b.pdf')
  })

  test('adding files does not move focus', async () => {
    const { container } = await render(<Example multiple />)
    const trigger = page.getByRole('button', { name: /^Choose files/ }).element()
    trigger.focus()
    await addFiles(container, pdf())
    expect(document.activeElement).toBe(trigger)
  })

  test('each item says its status in text, not only in colour', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf())
    const item = container.querySelector('li[data-status]')
    expect(item?.getAttribute('data-status')).toBe('pending')
    expect(item?.textContent?.length ?? 0).toBeGreaterThan('report.pdf'.length)
  })
})

describe('rejected files', () => {
  test('a file of the wrong type never enters the list: it is named in Rejections, with how to fix it', async () => {
    const onFilesReject = vi.fn<(rejections: readonly unknown[]) => void>()
    const { container } = await render(
      <Example multiple accept=".pdf" onFilesReject={onFilesReject} />,
    )
    await addFiles(container, new File(['x'], 'photo.png', { type: 'image/png' }))
    expect(container.querySelectorAll('li[data-status]')).toHaveLength(0)
    await expect.element(page.getByText(/photo\.png/).first()).toBeVisible()
    expect(onFilesReject).toHaveBeenCalledTimes(1)
  })

  test('an empty file is refused', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf('empty.pdf', ''))
    expect(container.querySelectorAll('li[data-status]')).toHaveLength(0)
    await expect.element(page.getByText(/empty\.pdf/).first()).toBeVisible()
  })

  test('the same file dropped twice is refused as a duplicate', async () => {
    const { container } = await render(<Example multiple />)
    const zone = container.querySelector('.kv-file-upload-drop-zone')
    const file = pdf('same.pdf', 'content')
    const drop = () => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      zone?.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true }))
    }
    drop()
    drop()
    await expect.poll(() => container.querySelectorAll('li[data-status]').length).toBe(1)
    await expect.element(page.getByText(/same\.pdf/).first()).toBeVisible()
  })

  test('the next add replaces the rejections', async () => {
    const { container } = await render(<Example multiple accept=".pdf" />)
    await addFiles(container, new File(['x'], 'photo.png', { type: 'image/png' }))
    await expect.element(page.getByText(/photo\.png/).first()).toBeVisible()
    await addFiles(container, pdf('ok.pdf'))
    expect(container.textContent).not.toContain('photo.png')
  })

  test('the Field is not marked invalid by a rejection', async () => {
    const { container } = await render(<Example multiple accept=".pdf" />)
    await addFiles(container, new File(['x'], 'photo.png', { type: 'image/png' }))
    const trigger = page.getByRole('button', { name: /^Choose files/ }).element()
    expect(trigger.hasAttribute('aria-invalid')).toBe(false)
  })
})

describe('the limit', () => {
  test('at maxFiles the Trigger stays focusable but is aria-disabled with data-disabled', async () => {
    const { container } = await render(<Example multiple maxFiles={1} />)
    await addFiles(container, pdf('a.pdf', 'aaa'))
    const trigger = page.getByRole('button', { name: /^Choose files/ }).element()
    expect(trigger.getAttribute('aria-disabled')).toBe('true')
    expect(trigger.hasAttribute('data-disabled')).toBe(true)
    expect((trigger as HTMLButtonElement).disabled).toBe(false)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)
  })

  test('a full list refuses another file and says it is full', async () => {
    const { container } = await render(<Example multiple maxFiles={1} />)
    await addFiles(container, pdf('a.pdf', 'aaa'))
    await addFiles(container, pdf('b.pdf', 'bbb'))
    expect(container.querySelectorAll('li[data-status]')).toHaveLength(1)
    await expect.element(page.getByText(/b\.pdf/).first()).toBeVisible()
  })
})

describe('focus after a removal', () => {
  test('removing an item focuses the next item, not its button', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf('a.pdf', 'aaa'), pdf('b.pdf', 'bbb'))
    await userEvent.click(page.getByRole('button', { name: /Remove\s+a\.pdf/ }))
    const items = container.querySelectorAll('li[data-status]')
    expect(items).toHaveLength(1)
    expect(document.activeElement).toBe(items[0])
    expect(items[0]?.getAttribute('tabindex')).toBe('-1')
    expect(items[0]?.textContent).toContain('b.pdf')
  })

  test('removing the last item focuses the previous one', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf('a.pdf', 'aaa'), pdf('b.pdf', 'bbb'))
    await userEvent.click(page.getByRole('button', { name: /Remove\s+b\.pdf/ }))
    const items = container.querySelectorAll('li[data-status]')
    expect(document.activeElement).toBe(items[0])
    expect(items[0]?.textContent).toContain('a.pdf')
  })

  test('removing the only item focuses the Trigger, never the body', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf('a.pdf', 'aaa'))
    await userEvent.click(page.getByRole('button', { name: /Remove\s+a\.pdf/ }))
    expect(container.querySelectorAll('li[data-status]')).toHaveLength(0)
    expect(document.activeElement).toBe(
      page.getByRole('button', { name: /^Choose files/ }).element(),
    )
  })

  test('clicking away from a button that is still there is not undone by the next progress tick (3.2.1)', async () => {
    let report: (fraction: number) => void = () => {}
    const upload = (_file: File, { onProgress }: { onProgress: (fraction: number) => void }) => {
      report = onProgress
      return new Promise<string>(() => {})
    }
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('report.pdf'))
    const cancel = page.getByRole('button', { name: /Cancel upload of report\.pdf/ })
    await expect.element(cancel).toBeVisible()
    cancel.element().focus()
    // The page background takes the click: focus goes to the body, and Cancel stays in the page.
    cancel.element().blur()
    // The tick renders before the blur handler's timer has run.
    flushSync(() => {
      report(0.5)
    })
    expect(container.querySelector<HTMLProgressElement>('progress')?.value).toBe(50)
    expect(document.activeElement).toBe(document.body)
  })
})

describe('uploading', () => {
  test('a native progress bar named for the file shows only while uploading, and the item completes', async () => {
    let finish: (result: string) => void = () => {}
    const upload = vi.fn<(file: File) => Promise<string>>(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve
        }),
    )
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('report.pdf'))
    await expect.element(page.getByRole('progressbar', { name: /report\.pdf/ })).toBeVisible()
    expect(container.querySelector('li[data-status]')?.getAttribute('data-status')).toBe(
      'uploading',
    )
    // While uploading, the only action is Cancel.
    expect(
      page.getByRole('button', { name: /Cancel upload of report\.pdf/ }).elements(),
    ).toHaveLength(1)
    expect(page.getByRole('button', { name: /^Remove / }).elements()).toHaveLength(0)

    finish('server-id-1')
    await expect
      .poll(() => container.querySelector('li[data-status]')?.getAttribute('data-status'))
      .toBe('complete')
    expect(container.querySelector('progress')).toBeNull()
  })

  test('when Cancel disappears because the upload finished, focus moves to the item, not to Remove', async () => {
    let finish: (result: string) => void = () => {}
    const upload = vi.fn<(file: File) => Promise<string>>(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve
        }),
    )
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('report.pdf'))
    const cancel = page.getByRole('button', { name: /Cancel upload of report\.pdf/ })
    await expect.element(cancel).toBeVisible()
    cancel.element().focus()
    expect(document.activeElement).toBe(cancel.element())
    finish('server-id-1')
    await expect
      .poll(() => container.querySelector('li[data-status]')?.getAttribute('data-status'))
      .toBe('complete')
    const item = container.querySelector('li[data-status]')
    expect(document.activeElement).toBe(item)
    expect(document.activeElement).not.toBe(document.body)
  })

  test('a failed upload offers Retry and Remove, and Retry restarts the same file', async () => {
    const upload = vi
      .fn<(file: File) => Promise<string>>()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue('ok')
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('report.pdf'))
    await expect
      .poll(() => container.querySelector('li[data-status]')?.getAttribute('data-status'))
      .toBe('failed')
    await userEvent.click(page.getByRole('button', { name: /Try again with report\.pdf/ }))
    await expect
      .poll(() => container.querySelector('li[data-status]')?.getAttribute('data-status'))
      .toBe('complete')
    expect(upload).toHaveBeenCalledTimes(2)
  })

  test('a failure shows neutral text and never the raw error message', async () => {
    const upload = vi
      .fn<(file: File) => Promise<string>>()
      .mockRejectedValue(new Error('ECONNRESET'))
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('report.pdf'))
    await expect
      .poll(() => container.querySelector('li[data-status]')?.getAttribute('data-status'))
      .toBe('failed')
    expect(container.textContent).not.toContain('ECONNRESET')
  })

  test('without an upload function files stay pending, to go with the form', async () => {
    const { container } = await render(<Example multiple inputName="attachments" />)
    await addFiles(container, pdf('report.pdf'))
    expect(container.querySelector('li[data-status]')?.getAttribute('data-status')).toBe('pending')
    expect(container.querySelector('progress')).toBeNull()
  })
})

const spoken = {
  en: {
    added: 'report.pdf added.',
    addedAndRefused: 'report.pdf added. 1 file couldn’t be added.',
    dropped:
      'report.pdf added. 1 file couldn’t be added: photo.png isn’t a type of file we can accept. Choose a file in PDF format.',
    removed: 'report.pdf removed.',
    full: '2 files added. 2 of 2 files added. Remove a file if you want to add a different one.',
    started: 'Uploading 1 file.',
    allUploaded: 'The file has been uploaded.',
    mixed: 'a.pdf uploaded. b.pdf couldn’t be uploaded.',
    remove: /^Remove report\.pdf/,
  },
  sv: {
    added: 'report.pdf har lagts till.',
    addedAndRefused: 'report.pdf har lagts till. 1 fil kunde inte läggas till.',
    dropped:
      'report.pdf har lagts till. 1 fil kunde inte läggas till: photo.png har ett filformat som inte går att använda. Välj en fil i formatet PDF.',
    removed: 'report.pdf har tagits bort.',
    full: '2 filer har lagts till. 2 av 2 filer tillagda. Ta bort en fil om du vill lägga till en annan.',
    started: 'Laddar upp 1 fil.',
    allUploaded: 'Filen har laddats upp.',
    mixed: 'a.pdf har laddats upp. b.pdf kunde inte laddas upp.',
    remove: /^Ta bort report\.pdf/,
  },
} as const

type UploadWithProgress = (
  file: File,
  context: { onProgress: (fraction: number) => void },
) => Promise<string>

const politeText = () => document.querySelector('[aria-live="polite"]')?.textContent ?? ''

/**
 * Moves the fake clock and reads the polite live region. The Announcer sets a message 100 ms after
 * it clears the region, so a message is in the region 101 ms after the call.
 */
async function advance(milliseconds: number) {
  await vi.advanceTimersByTimeAsync(milliseconds)
  return politeText()
}

/** Renders under a provider in `locale`, then freezes timers and the clock, so no test waits. */
async function renderAnnounced(locale: 'en' | 'sv', content: ReactElement) {
  const view = await render(
    locale === 'sv' ? (
      <KvirnProvider locale="sv" messages={sv}>
        {content}
      </KvirnProvider>
    ) : (
      <KvirnProvider locale="en">{content}</KvirnProvider>
    ),
  )
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
  return view
}

/**
 * Chooses files the way the dialog reports them. No round trip to the test server, which fake
 * timers could hold up.
 */
function chooseFiles(container: Element, ...files: File[]) {
  const dataTransfer = new DataTransfer()
  for (const file of files) {
    dataTransfer.items.add(file)
  }
  const input = fileInput(container)
  input.files = dataTransfer.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

/** Presses a button with a plain DOM click: no round trip to the test server, which fake timers could hold up. */
function pressButton(name: string | RegExp) {
  const button = page.getByRole('button', { name }).element()
  if (!(button instanceof HTMLElement)) {
    throw new Error('the button is not an HTML element')
  }
  button.click()
}

/** The hook's `uploadAll`, which no part exposes: a Send button that calls it (autoUpload off). */
function ManualUpload({ upload }: { upload: UploadWithProgress }) {
  const fileUpload = useFileUpload({ multiple: true, autoUpload: false, upload })
  return (
    <div {...fileUpload.rootProps}>
      <input {...fileUpload.inputProps} />
      <button
        type="button"
        onClick={() => {
          fileUpload.uploadAll()
        }}
      >
        Send now
      </button>
    </div>
  )
}

describe.each(['en', 'sv'] as const)('announcements in %s (4.1.3)', (locale) => {
  const texts = spoken[locale]
  const neverResolves: UploadWithProgress = () => new Promise<string>(() => {})

  test('a dialog add announces the file, and a refusal as a count only', async () => {
    const { container } = await renderAnnounced(locale, <Example multiple accept=".pdf" />)
    chooseFiles(container, pdf('report.pdf'), png())
    expect(await advance(101)).toBe(texts.addedAndRefused)
    expect(politeText()).not.toContain('photo.png')
  })

  test('a drop announces the full sentence for each refused file', async () => {
    const { container } = await renderAnnounced(locale, <Example multiple accept=".pdf" />)
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(pdf('report.pdf'))
    dataTransfer.items.add(png())
    container
      .querySelector('.kv-file-upload-drop-zone')
      ?.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true }))
    expect(await advance(101)).toBe(texts.dropped)
  })

  test('a removal is announced', async () => {
    const upload = vi.fn<UploadWithProgress>().mockRejectedValue(new Error('network'))
    const { container } = await renderAnnounced(locale, <Example multiple upload={upload} />)
    chooseFiles(container, pdf('report.pdf'))
    expect(await advance(101)).toBe(texts.added)
    pressButton(texts.remove)
    expect(await advance(101)).toBe(texts.removed)
  })

  test('the list filling up is announced with what to do next', async () => {
    const { container } = await renderAnnounced(locale, <Example multiple maxFiles={2} />)
    chooseFiles(container, pdf('a.pdf', 'aaa'), pdf('b.pdf', 'bbb'))
    expect(await advance(101)).toBe(texts.full)
  })

  test('starting the uploads by hand is announced with how many', async () => {
    const { container } = await renderAnnounced(locale, <ManualUpload upload={neverResolves} />)
    chooseFiles(container, pdf('report.pdf'))
    expect(await advance(101)).toBe(texts.added)
    pressButton('Send now')
    expect(await advance(101)).toBe(texts.started)
  })

  test('a finished upload is held until a second of quiet, then announced from the store', async () => {
    let finish: (result: string) => void = () => {}
    const upload = vi.fn<UploadWithProgress>(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve
        }),
    )
    const { container } = await renderAnnounced(locale, <Example multiple upload={upload} />)
    chooseFiles(container, pdf('report.pdf'))
    expect(await advance(101)).toBe(texts.added)
    finish('server-id')
    expect(await advance(600)).toBe(texts.added)
    expect(await advance(600)).toBe(texts.allUploaded)
  })

  test('a finished and a failed upload are one message', async () => {
    const upload = vi
      .fn<UploadWithProgress>()
      .mockImplementation((file) =>
        file.name === 'b.pdf' ? Promise.reject(new Error('network')) : Promise.resolve('server-id'),
      )
    const { container } = await renderAnnounced(locale, <Example multiple upload={upload} />)
    chooseFiles(container, pdf('a.pdf', 'aaa'), pdf('b.pdf', 'bbb'))
    await advance(101)
    expect(await advance(600)).not.toBe(texts.mixed)
    expect(await advance(700)).toBe(texts.mixed)
  })

  test('the result of a file removed before the second of quiet is dropped', async () => {
    const upload = vi.fn<UploadWithProgress>().mockRejectedValue(new Error('network'))
    const { container } = await renderAnnounced(locale, <Example multiple upload={upload} />)
    chooseFiles(container, pdf('report.pdf'))
    await advance(101)
    pressButton(texts.remove)
    expect(await advance(101)).toBe(texts.removed)
    expect(await advance(2000)).toBe(texts.removed)
  })

  test('progress is never announced', async () => {
    let report: (fraction: number) => void = () => {}
    const upload: UploadWithProgress = (_file, { onProgress }) => {
      report = onProgress
      return new Promise<string>(() => {})
    }
    const { container } = await renderAnnounced(locale, <Example multiple upload={upload} />)
    chooseFiles(container, pdf('report.pdf'))
    expect(await advance(101)).toBe(texts.added)
    for (const fraction of [0.2, 0.5, 0.9]) {
      report(fraction)
      expect(await advance(1000)).toBe(texts.added)
    }
    expect(politeText()).not.toMatch(/\d\s?%/)
  })
})

describe('dragging', () => {
  /** A drag with a file in it. `dropEffect` records what the component set, from `'move'`. */
  function dragWithFile(type: string, relatedTarget: Element | null = null) {
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(pdf('dragged.pdf'))
    let dropEffect: DataTransfer['dropEffect'] = 'move'
    Object.defineProperty(dataTransfer, 'dropEffect', {
      get: () => dropEffect,
      set: (value: DataTransfer['dropEffect']) => {
        dropEffect = value
      },
    })
    const event = new DragEvent(type, {
      dataTransfer,
      relatedTarget,
      bubbles: true,
      cancelable: true,
    })
    return { event, dropEffect: () => dropEffect }
  }

  const zoneOf = (container: Element) => {
    const zone = container.querySelector('.kv-file-upload-drop-zone')
    if (zone === null) {
      throw new Error('no drop zone')
    }
    return zone
  }

  test('a file over the zone sets data-dragging and allows a copy, and leaving the zone clears it', async () => {
    const { container } = await render(<Example multiple />)
    const zone = zoneOf(container)
    const enter = dragWithFile('dragenter')
    zone.dispatchEvent(enter.event)
    await expect.poll(() => zone.hasAttribute('data-dragging')).toBe(true)
    expect(enter.event.defaultPrevented).toBe(true)
    expect(enter.dropEffect()).toBe('copy')
    // Moving onto a child of the zone is not leaving it.
    const trigger = container.querySelector('.kv-file-upload-trigger')
    zone.dispatchEvent(dragWithFile('dragleave', trigger).event)
    expect(zone.hasAttribute('data-dragging')).toBe(true)
    zone.dispatchEvent(dragWithFile('dragleave').event)
    await expect.poll(() => zone.hasAttribute('data-dragging')).toBe(false)
  })

  test('the hint changes to say what dropping does, while a file is over the zone', async () => {
    const { container } = await render(<Example multiple />)
    const zone = zoneOf(container)
    zone.dispatchEvent(dragWithFile('dragenter').event)
    zone.dispatchEvent(dragWithFile('dragover').event)
    await expect.element(page.getByText('Drop the files to add them')).toBeVisible()
  })

  test('a disabled zone shows no dragging state, refuses the drop with "none" and adds nothing', async () => {
    const { container } = await render(<Example multiple disabled />)
    const zone = zoneOf(container)
    const over = dragWithFile('dragover')
    zone.dispatchEvent(over.event)
    expect(over.dropEffect()).toBe('none')
    expect(zone.hasAttribute('data-dragging')).toBe(false)
    const drop = dragWithFile('drop')
    zone.dispatchEvent(drop.event)
    // The browser must not open the file and leave the page.
    expect(drop.event.defaultPrevented).toBe(true)
    expect(container.querySelectorAll('li[data-status]')).toHaveLength(0)
  })
})

describe('previews', () => {
  test('the object URL made for a preview is revoked when the item is removed', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL')
    const { container } = await render(
      <Example multiple>
        <FileUpload.List>
          {(item) => (
            <FileUpload.Item key={item.id} item={item}>
              <FileUpload.Preview />
              <FileUpload.Name />
              <FileUpload.Actions>
                <FileUpload.RemoveButton />
              </FileUpload.Actions>
            </FileUpload.Item>
          )}
        </FileUpload.List>
      </Example>,
    )
    await addFiles(container, new File(['x'], 'photo.png', { type: 'image/png' }))
    await expect.poll(() => createObjectURL.mock.results.length).toBeGreaterThan(0)
    const url = createObjectURL.mock.results[0]?.value
    expect(revokeObjectURL).not.toHaveBeenCalledWith(url)
    await userEvent.click(page.getByRole('button', { name: /Remove photo\.png/ }))
    await expect.poll(() => revokeObjectURL.mock.calls.map(([revoked]) => revoked)).toContain(url)
  })
})

describe('the Field label (D9)', () => {
  test('a click on the label opens the dialog, and does nothing once the list is full', async () => {
    const { container } = await render(<Example multiple maxFiles={2} />)
    const showPicker = vi.spyOn(fileInput(container), 'showPicker').mockImplementation(() => {})
    const label = container.querySelector('label')
    if (label === null) {
      throw new Error('no label')
    }
    await userEvent.click(label)
    expect(showPicker).toHaveBeenCalledTimes(1)
    await addFiles(container, pdf('a.pdf', 'aaa'), pdf('b.pdf', 'bbb'))
    await expect.poll(() => container.querySelectorAll('li[data-status]').length).toBe(2)
    // Playwright refuses to click a label whose control is aria-disabled, so click it in the page:
    // the browser still passes the click on to the Trigger, which has to block it.
    label.click()
    expect(showPicker).toHaveBeenCalledTimes(1)
  })
})

describe('development warnings', () => {
  test('a part outside a FileUpload.Root says so', async () => {
    await render(<FileUpload.Trigger />)
    await vi.waitFor(() => {
      expect(
        warnings().some((text) => text.includes('FileUpload.Trigger is outside a FileUpload.Root')),
      ).toBe(true)
    })
  })

  test('limits that nobody says warn (3.3.2)', async () => {
    await render(
      <Field.Root>
        <Field.Label>Attachments</Field.Label>
        <FileUpload.Root accept=".pdf" maxFiles={3}>
          <FileUpload.Trigger />
        </FileUpload.Root>
      </Field.Root>,
    )
    await vi.waitFor(() => {
      expect(warnings().some((text) => text.includes('WCAG 3.3.2'))).toBe(true)
    })
  })

  test('limits said by FileUpload.Limits do not warn', async () => {
    await render(
      <Field.Root>
        <Field.Label>Attachments</Field.Label>
        <FileUpload.Root accept=".pdf" maxFiles={3}>
          <FileUpload.Trigger />
          <FileUpload.Limits />
        </FileUpload.Root>
      </Field.Root>,
    )
    // The check runs in a timer started when the Root mounted: this one is queued after it.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(warnings().some((text) => text.includes('WCAG 3.3.2'))).toBe(false)
  })

  test('files added without a KvirnProvider warn that nothing is announced', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf())
    await vi.waitFor(() => {
      expect(warnings().some((text) => text.includes('outside a <KvirnProvider>'))).toBe(true)
    })
  })

  test('a Trigger whose render drops the text span warns that its name no longer starts with its text (2.5.3)', async () => {
    await render(
      <Field.Root>
        <Field.Label>Attachments</Field.Label>
        <FileUpload.Root>
          <FileUpload.Trigger render={(props) => <button {...props}>Own text</button>} />
        </FileUpload.Root>
      </Field.Root>,
    )
    await vi.waitFor(() => {
      expect(warnings().some((text) => text.includes('WCAG 2.5.3'))).toBe(true)
    })
  })

  test('a browser that cannot set the files of the input warns that dropped files will not be posted', async () => {
    vi.stubGlobal(
      'DataTransfer',
      class {
        constructor() {
          throw new Error('unsupported')
        }
      },
    )
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf())
    await vi.waitFor(() => {
      expect(warnings().some((text) => text.includes('DataTransfer'))).toBe(true)
    })
  })
})

describe('the public API', () => {
  test('every part takes render, merges class, handlers and refs, and carries its part class', async () => {
    const seen = new Map<string, Set<Element>>()
    const track = (name: string) => (element: Element | null) => {
      if (element !== null) {
        seen.set(name, (seen.get(name) ?? new Set<Element>()).add(element))
      }
    }
    const handlers = {
      root: vi.fn<() => void>(),
      trigger: vi.fn<() => void>(),
      remove: vi.fn<() => void>(),
    }
    const upload = (file: File, { onProgress }: { onProgress: (fraction: number) => void }) => {
      if (file.name === 'bad.pdf') {
        return Promise.reject(new Error('network'))
      }
      onProgress(0.4)
      return new Promise<string>(() => {})
    }
    const { container } = await render(
      <Field.Root>
        <Field.Label>Attachments</Field.Label>
        <FileUpload.Root
          multiple
          accept=".pdf"
          upload={upload}
          className="own"
          ref={track('Root')}
          onClick={handlers.root}
          render={<div data-rendered="Root" />}
        >
          <FileUpload.DropZone
            className="own"
            ref={track('DropZone')}
            render={<div data-rendered="DropZone" />}
          >
            <FileUpload.Trigger
              className="own"
              ref={track('Trigger')}
              onClick={handlers.trigger}
              render={(props) => <button {...props} data-rendered="Trigger" />}
            />
            <FileUpload.DropHint
              className="own"
              ref={track('DropHint')}
              render={<p data-rendered="DropHint" />}
            />
          </FileUpload.DropZone>
          <FileUpload.Limits
            className="own"
            ref={track('Limits')}
            render={<p data-rendered="Limits" />}
          />
          <FileUpload.Rejections
            className="own"
            ref={track('Rejections')}
            render={<div data-rendered="Rejections" />}
          />
          <FileUpload.Summary
            className="own"
            ref={track('Summary')}
            render={<p data-rendered="Summary" />}
          />
          <FileUpload.Input
            className="own"
            ref={track('Input')}
            render={<input data-rendered="Input" />}
          />
          <FileUpload.List className="own" ref={track('List')} render={<ul data-rendered="List" />}>
            {(item) => (
              <FileUpload.Item
                key={item.id}
                item={item}
                className="own"
                ref={track('Item')}
                render={(props) => <li {...props} data-rendered="Item" />}
              >
                <FileUpload.Preview
                  className="own"
                  ref={track('Preview')}
                  render={<span data-rendered="Preview" />}
                />
                <FileUpload.Name
                  className="own"
                  ref={track('Name')}
                  render={<bdi data-rendered="Name" />}
                />
                <FileUpload.Type
                  className="own"
                  ref={track('Type')}
                  render={<span data-rendered="Type" />}
                />
                <FileUpload.Size
                  className="own"
                  ref={track('Size')}
                  render={<span data-rendered="Size" />}
                />
                <FileUpload.Status
                  className="own"
                  ref={track('Status')}
                  render={<p data-rendered="Status" />}
                />
                <FileUpload.Progress
                  className="own"
                  ref={track('Progress')}
                  render={<progress data-rendered="Progress" />}
                />
                <FileUpload.ItemError
                  className="own"
                  ref={track('ItemError')}
                  render={<p data-rendered="ItemError" />}
                />
                <FileUpload.Actions
                  className="own"
                  ref={track('Actions')}
                  render={<div data-rendered="Actions" />}
                >
                  <FileUpload.CancelButton
                    className="own"
                    ref={track('CancelButton')}
                    render={<button data-rendered="CancelButton">Cancel</button>}
                  />
                  <FileUpload.RetryButton
                    className="own"
                    ref={track('RetryButton')}
                    render={<button data-rendered="RetryButton">Retry</button>}
                  />
                  <FileUpload.RemoveButton
                    className="own"
                    ref={track('RemoveButton')}
                    onClick={handlers.remove}
                    render={<button data-rendered="RemoveButton">Remove</button>}
                  />
                </FileUpload.Actions>
              </FileUpload.Item>
            )}
          </FileUpload.List>
        </FileUpload.Root>
      </Field.Root>,
    )
    const showPicker = vi.spyOn(fileInput(container), 'showPicker').mockImplementation(() => {})
    const zone = container.querySelector('.kv-file-upload-drop-zone')
    // A file dragged over the page draws the zone and its hint.
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(pdf('dragged.pdf'))
    zone?.dispatchEvent(
      new DragEvent('dragover', { dataTransfer, bubbles: true, cancelable: true }),
    )
    await addFiles(container, pdf('up.pdf'), pdf('bad.pdf', 'bbb'), png())
    await expect.poll(() => container.querySelector('li[data-status="failed"]')).not.toBeNull()
    await expect.poll(() => container.querySelector('[data-rendered="DropHint"]')).not.toBeNull()

    const partClasses = {
      Root: ['kv-file-upload'],
      DropZone: ['kv-file-upload-drop-zone'],
      Trigger: ['kv-button', 'kv-file-upload-trigger'],
      DropHint: ['kv-file-upload-drop-hint'],
      Limits: ['kv-file-upload-limits'],
      Rejections: ['kv-file-upload-rejections'],
      Summary: ['kv-file-upload-summary'],
      Input: [],
      List: ['kv-file-upload-list'],
      Item: ['kv-file-upload-item'],
      Preview: ['kv-file-upload-preview'],
      Name: ['kv-file-upload-name'],
      Type: ['kv-file-upload-type'],
      Size: ['kv-file-upload-size'],
      Status: ['kv-file-upload-status'],
      Progress: ['kv-file-upload-progress'],
      ItemError: ['kv-file-upload-item-error'],
      Actions: ['kv-file-upload-actions'],
      CancelButton: ['kv-button', 'kv-file-upload-cancel'],
      RetryButton: ['kv-button', 'kv-file-upload-retry'],
      RemoveButton: ['kv-button', 'kv-file-upload-remove'],
    }
    for (const [name, classes] of Object.entries(partClasses)) {
      const elements = [...container.querySelectorAll(`[data-rendered="${name}"]`)]
      expect(elements.length, `${name} is rendered`).toBeGreaterThan(0)
      for (const element of elements) {
        expect(element.classList.contains('own'), `${name} keeps the consumer's class`).toBe(true)
        for (const className of classes) {
          expect(element.classList.contains(className), `${name} has ${className}`).toBe(true)
        }
        expect(seen.get(name)?.has(element), `${name} calls the consumer's ref`).toBe(true)
      }
    }

    // Handlers chain with the part's own: the dialog opens and the file is removed.
    await userEvent.click(page.getByRole('button', { name: /^Choose files/ }))
    expect(handlers.trigger).toHaveBeenCalledTimes(1)
    expect(showPicker).toHaveBeenCalledTimes(1)
    await userEvent.click(page.getByRole('button', { name: /Remove bad\.pdf/ }))
    expect(handlers.remove).toHaveBeenCalledTimes(1)
    expect(handlers.root).toHaveBeenCalled()
    await expect.poll(() => container.querySelectorAll('li[data-status]').length).toBe(1)
    // The hook's ref on the Item still works next to the consumer's: focus lands on the other item.
    await expect.poll(() => document.activeElement?.getAttribute('data-rendered')).toBe('Item')
    expect(document.activeElement?.textContent).toContain('up.pdf')
  })
})

describe('accessibility', () => {
  test('passes axe: empty', async () => {
    const { container } = await render(<Example multiple />)
    await expect.element(page.getByRole('button', { name: /^Choose files/ })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: with files, pending and uploading', async () => {
    const upload = vi.fn<(file: File) => Promise<string>>(() => new Promise<string>(() => {}))
    const { container } = await render(<Example multiple upload={upload} />)
    await addFiles(container, pdf('a.pdf', 'aaa'), pdf('b.pdf', 'bbb'))
    await expect.element(page.getByRole('button', { name: /^Choose files/ })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: with a rejection and at the limit', async () => {
    const { container } = await render(<Example multiple maxFiles={1} accept=".pdf" />)
    await addFiles(container, pdf('a.pdf', 'aaa'))
    await addFiles(container, new File(['x'], 'photo.png', { type: 'image/png' }))
    await expect.element(page.getByRole('button', { name: /^Choose files/ })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: required and invalid', async () => {
    const { container } = await render(<Example multiple required invalid />)
    await expect.element(page.getByRole('button', { name: /^Choose files/ })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('passes axe: disabled', async () => {
    const { container } = await render(<Example multiple disabled />)
    await expect.element(page.getByRole('button', { name: /^Choose files/ })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
