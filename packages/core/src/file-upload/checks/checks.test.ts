import { describe, expect, test } from 'vite-plus/test'
import { checkAccept, matchesAccept, parseAccept } from './accept.ts'
import { checkFile } from './check-file.ts'
import { checkDuplicate, checkEmpty, checkFolder } from './content.ts'
import { checkCustom, checkMaxFiles, checkMaxFileSize, checkMinFileSize } from './limits.ts'

const file = (name: string, type: string, size = 10) => ({ name, type, size })

describe('parseAccept', () => {
  test('splits on commas, trims, lower-cases and drops blanks', () => {
    expect(parseAccept(' .PDF, image/JPEG ,, image/* ')).toEqual(['.pdf', 'image/jpeg', 'image/*'])
  })

  test('no accept means no entries', () => {
    expect(parseAccept(undefined)).toEqual([])
    expect(parseAccept('')).toEqual([])
    expect(parseAccept(' , ')).toEqual([])
  })
})

describe('accept', () => {
  test('no entries accepts every file', () => {
    expect(checkAccept(file('a.exe', ''), undefined)).toBeUndefined()
    expect(checkAccept(file('a.exe', ''), '')).toBeUndefined()
  })

  test('an extension matches the end of the name', () => {
    expect(checkAccept(file('report.pdf', ''), '.pdf')).toBeUndefined()
    expect(checkAccept(file('report.pdf.exe', ''), '.pdf')).toEqual({
      kind: 'type',
      allowed: ['.pdf'],
    })
    expect(checkAccept(file('pdf', ''), '.pdf')).toEqual({ kind: 'type', allowed: ['.pdf'] })
  })

  test('an extension can have more than one dot', () => {
    expect(checkAccept(file('backup.tar.gz', ''), '.tar.gz')).toBeUndefined()
    expect(checkAccept(file('backup.gz', ''), '.tar.gz')).toEqual({
      kind: 'type',
      allowed: ['.tar.gz'],
    })
  })

  test('a MIME type matches exactly', () => {
    expect(checkAccept(file('a', 'application/pdf'), 'application/pdf')).toBeUndefined()
    expect(checkAccept(file('a', 'application/pdfx'), 'application/pdf')).toEqual({
      kind: 'type',
      allowed: ['application/pdf'],
    })
  })

  test('a wildcard matches every subtype, and only that type', () => {
    expect(checkAccept(file('a', 'image/png'), 'image/*')).toBeUndefined()
    expect(checkAccept(file('a', 'image/svg+xml'), 'image/*')).toBeUndefined()
    expect(checkAccept(file('a', 'video/mp4'), 'image/*')).toEqual({
      kind: 'type',
      allowed: ['image/*'],
    })
    expect(checkAccept(file('a', 'imagery/x'), 'image/*')).toEqual({
      kind: 'type',
      allowed: ['image/*'],
    })
    expect(checkAccept(file('a', ''), 'image/*')).toEqual({ kind: 'type', allowed: ['image/*'] })
  })

  test('*/* matches every file', () => {
    expect(matchesAccept(file('a', 'video/mp4'), ['*/*'])).toBe(true)
  })

  test('is case-insensitive for extensions and MIME types, on both sides', () => {
    expect(checkAccept(file('SCAN.PDF', ''), '.pdf')).toBeUndefined()
    expect(checkAccept(file('scan.pdf', ''), '.PDF')).toBeUndefined()
    expect(checkAccept(file('a', 'IMAGE/PNG'), 'image/png')).toBeUndefined()
    expect(checkAccept(file('a', 'image/png'), 'Image/PNG')).toBeUndefined()
    expect(checkAccept(file('a', 'IMAGE/PNG'), 'IMAGE/*')).toBeUndefined()
  })

  test('ignores the MIME type’s parameters', () => {
    expect(checkAccept(file('a.txt', 'text/plain;charset=utf-8'), 'text/plain')).toBeUndefined()
  })

  test('a comma list matches when any entry does, mixing extensions, types and wildcards', () => {
    const accept = '.pdf, image/jpeg ,IMAGE/PNG'
    expect(checkAccept(file('a.pdf', 'application/pdf'), accept)).toBeUndefined()
    expect(checkAccept(file('a.jpg', 'image/jpeg'), accept)).toBeUndefined()
    expect(checkAccept(file('a.png', 'image/png'), accept)).toBeUndefined()
    expect(checkAccept(file('a.docx', 'application/msword'), accept)).toEqual({
      kind: 'type',
      allowed: ['.pdf', 'image/jpeg', 'image/png'],
    })
  })

  test('an extension matches a file the browser gave no type', () => {
    expect(checkAccept(file('scan.pdf', ''), '.pdf,image/*')).toBeUndefined()
  })
})

describe('size limits', () => {
  test('maxFileSize rejects a larger file and allows one exactly at the limit', () => {
    expect(checkMaxFileSize(file('a', '', 11), 10)).toEqual({ kind: 'tooLarge', limit: 10 })
    expect(checkMaxFileSize(file('a', '', 10), 10)).toBeUndefined()
    expect(checkMaxFileSize(file('a', '', 9), 10)).toBeUndefined()
  })

  test('minFileSize rejects a smaller file and allows one exactly at the limit', () => {
    expect(checkMinFileSize(file('a', '', 9), 10)).toEqual({ kind: 'tooSmall', limit: 10 })
    expect(checkMinFileSize(file('a', '', 10), 10)).toBeUndefined()
    expect(checkMinFileSize(file('a', '', 11), 10)).toBeUndefined()
  })

  test('a limit of 0 is a limit: maxFileSize 0 rejects any byte, minFileSize 1 rejects an empty file', () => {
    expect(checkMaxFileSize(file('a', '', 1), 0)).toEqual({ kind: 'tooLarge', limit: 0 })
    expect(checkMinFileSize(file('a', '', 0), 1)).toEqual({ kind: 'tooSmall', limit: 1 })
  })

  test('no limit allows everything', () => {
    expect(checkMaxFileSize(file('a', '', 1e12), undefined)).toBeUndefined()
    expect(checkMinFileSize(file('a', '', 0), undefined)).toBeUndefined()
  })
})

describe('maxFiles', () => {
  test('rejects once the count has reached the limit', () => {
    expect(checkMaxFiles(2, 3)).toBeUndefined()
    expect(checkMaxFiles(3, 3)).toEqual({ kind: 'tooMany', maxFiles: 3 })
    expect(checkMaxFiles(4, 3)).toEqual({ kind: 'tooMany', maxFiles: 3 })
  })

  test('no limit allows everything', () => {
    expect(checkMaxFiles(1000, undefined)).toBeUndefined()
  })
})

describe('empty, folder and duplicate', () => {
  test('a file of size 0 is empty, any other size is not', () => {
    expect(checkEmpty(file('a', '', 0))).toEqual({ kind: 'empty' })
    expect(checkEmpty(file('a', '', 1))).toBeUndefined()
  })

  test('only isDirectory: true is a folder', () => {
    expect(checkFolder({ isDirectory: true })).toEqual({ kind: 'folder' })
    expect(checkFolder({ isDirectory: false })).toBeUndefined()
    expect(checkFolder({})).toBeUndefined()
  })

  test('a duplicate needs the same name, size and last-modified time', () => {
    const existing = [{ name: 'a.pdf', size: 10, lastModified: 5 }]
    expect(checkDuplicate({ name: 'a.pdf', size: 10, lastModified: 5 }, existing)).toEqual({
      kind: 'duplicate',
    })
    expect(checkDuplicate({ name: 'b.pdf', size: 10, lastModified: 5 }, existing)).toBeUndefined()
    expect(checkDuplicate({ name: 'a.pdf', size: 11, lastModified: 5 }, existing)).toBeUndefined()
    expect(checkDuplicate({ name: 'a.pdf', size: 10, lastModified: 6 }, existing)).toBeUndefined()
    expect(checkDuplicate({ name: 'a.pdf', size: 10, lastModified: 5 }, [])).toBeUndefined()
  })
})

describe('validate', () => {
  const anyFile = new File(['x'], 'a.txt')

  test('a message rejects as custom, with the consumer’s own text', () => {
    expect(checkCustom(anyFile, () => 'Name the file after the case number')).toEqual({
      kind: 'custom',
      message: 'Name the file after the case number',
    })
  })

  test('nothing, null, undefined or an empty string accepts', () => {
    expect(checkCustom(anyFile, undefined)).toBeUndefined()
    expect(checkCustom(anyFile, () => undefined)).toBeUndefined()
    expect(checkCustom(anyFile, () => null)).toBeUndefined()
    expect(checkCustom(anyFile, () => '')).toBeUndefined()
  })

  test('gets the file', () => {
    let received: File | undefined
    checkCustom(anyFile, (given) => {
      received = given
    })
    expect(received).toBe(anyFile)
  })
})

describe('checkFile', () => {
  const small = new File(['x'], 'a.docx', { type: 'application/msword' })

  test('returns undefined when every check passes', () => {
    expect(
      checkFile(new File(['x'], 'a.pdf'), { accept: '.pdf', maxFileSize: 5 }, 0),
    ).toBeUndefined()
  })

  test('the type is reported before the size, the size before validate, and the room last', () => {
    const everything = {
      accept: '.pdf',
      maxFileSize: 0,
      minFileSize: 5,
      validate: () => 'no',
      maxFiles: 1,
    }
    expect(checkFile(small, everything, 1)?.kind).toBe('type')
    const pdf = new File(['x'], 'a.pdf')
    expect(checkFile(pdf, everything, 1)?.kind).toBe('tooLarge')
    expect(checkFile(pdf, { ...everything, maxFileSize: 5 }, 1)?.kind).toBe('tooSmall')
    expect(checkFile(pdf, { ...everything, maxFileSize: 5, minFileSize: 0 }, 1)?.kind).toBe(
      'custom',
    )
    expect(
      checkFile(pdf, { ...everything, maxFileSize: 5, minFileSize: 0, validate: undefined }, 1)
        ?.kind,
    ).toBe('tooMany')
  })

  test('empty, folder and duplicate are reasons too', () => {
    const empty = new File([], 'a.pdf')
    expect(checkFile(empty, {}, 0)?.kind).toBe('empty')
    const folder = Object.assign(new File(['x'], 'Receipts'), { isDirectory: true })
    expect(checkFile(folder, { accept: '.pdf' }, 0)?.kind).toBe('folder')
    const pdf = new File(['x'], 'a.pdf', { lastModified: 1 })
    expect(checkFile(pdf, {}, 1, [pdf])?.kind).toBe('duplicate')
  })

  test('allowDuplicates turns the duplicate check off', () => {
    const pdf = new File(['x'], 'a.pdf', { lastModified: 1 })
    expect(checkFile(pdf, { allowDuplicates: true }, 1, [pdf])).toBeUndefined()
    expect(checkFile(pdf, { allowDuplicates: false }, 1, [pdf])?.kind).toBe('duplicate')
  })

  test('the duplicate is reported before validate and before the room', () => {
    const pdf = new File(['x'], 'a.pdf', { lastModified: 1 })
    expect(checkFile(pdf, { validate: () => 'no', maxFiles: 1 }, 1, [pdf])?.kind).toBe('duplicate')
  })

  test('multiple: false makes the room 1, whatever maxFiles says', () => {
    const pdf = new File(['x'], 'a.pdf')
    expect(checkFile(pdf, { multiple: false, maxFiles: 5 }, 0)).toBeUndefined()
    expect(checkFile(pdf, { multiple: false, maxFiles: 5 }, 1)).toEqual({
      kind: 'tooMany',
      maxFiles: 1,
    })
    expect(checkFile(pdf, { multiple: true, maxFiles: 5 }, 1)).toBeUndefined()
  })
})
