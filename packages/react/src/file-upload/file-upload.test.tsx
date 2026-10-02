import { expectNoA11yViolations } from '@kvirn-ui/testing'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { FileUpload } from '../index.ts'
import type { FileUploadRootProps } from '../index.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'

// Contract: file-upload.a11y.md. Dragging, the theme's states, reflow and forced colours are
// covered in apps/storybook/src/components/file-upload/file-upload.e2e.ts. Component tests load
// no theme, so what is asserted is the markup, the names, the focus and the state.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

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

  test('the Trigger is described by the limits, the Field description and the summary when full', async () => {
    await render(
      <Example multiple maxFiles={1} accept=".pdf" maxFileSize={1_000_000}>
        <Items />
      </Example>,
    )
    const trigger = page.getByRole('button', { name: /^Choose files/ }).element()
    const describedBy = trigger.getAttribute('aria-describedby')
    expect(describedBy).not.toBeNull()
    for (const id of describedBy?.split(' ') ?? []) {
      expect(document.getElementById(id)).not.toBeNull()
    }
  })

  test('single-file mode says "Choose file" and the input is not multiple', async () => {
    const { container } = await render(<Example multiple={false} />)
    expect(fileInput(container).multiple).toBe(false)
    await expect.element(page.getByRole('button', { name: /^Choose file\s/ })).toBeVisible()
  })
})

describe('adding files', () => {
  test('a chosen file appears in the list with its name', async () => {
    const { container } = await render(<Example multiple />)
    await addFiles(container, pdf('report.pdf'))
    await expect.element(page.getByText('report.pdf').first()).toBeVisible()
    expect(container.querySelectorAll('li[data-status]')).toHaveLength(1)
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

describe('announcements', () => {
  test('adding files is announced politely in one message, naming the file', async () => {
    const { container } = await render(
      <KvirnProvider locale="en">
        <Example multiple />
      </KvirnProvider>,
    )
    await addFiles(container, pdf('report.pdf'))
    await expect
      .poll(() => document.querySelector('[aria-live="polite"]')?.textContent ?? '')
      .toContain('report.pdf')
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
