import contract from '../../../../../packages/react/src/file-upload/file-upload.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  controlledUpload,
  FileUploadField,
  fileUploadTextsFor,
  makeFile,
  makeImage,
} from './file-upload.fixture.tsx'

// Components/Form/FileUpload: attach files to an application (Plan 0021, design spec
// docs/design/file-upload.md). One native button opens the system dialog: that is the way in for
// the keyboard, voice, switch and touch. A drop zone is an extra on devices that drag. The native
// `<input type="file">` is hidden from assistive technology and never required. Every limit is
// checked here, because a drop and "All files" skip the browser's checks, and a refused file never
// enters the list: it is named under the button, with how to fix it. The component sends nothing
// anywhere (hard rule 7): `upload` is the consumer's own function, and these stories stand in for
// it with `controlledUpload`. Client checks aren't security: the server checks type, size and
// content again.
//
// KvirnUI holds no form state. The Field's `invalid` and message stay with the
// consumer, who decides whether a refused file blocks the form. file-upload.e2e.ts runs the keys,
// the drop, focus after a removal, RTL, forced colours, reduced motion and reflow.

const meta = {
  title: 'Components/Form/FileUpload',
  component: FileUploadField,
  globals: { locale: 'sv' },
  argTypes: {
    accept: { control: 'text', description: 'Accepted types, like the native `accept`.' },
    maxFiles: { control: 'number', description: 'How many files the list holds.' },
    maxFileSize: { control: 'number', description: 'Largest file, in bytes.' },
    minFileSize: { control: 'number', description: 'Smallest file, in bytes.' },
    multiple: { control: 'boolean', description: 'Default true. Off: a new file replaces.' },
    concurrency: { control: 'number', description: 'Uploads at once. Default 3.' },
    allowDuplicates: { control: 'boolean' },
    disabled: { control: 'boolean' },
    upload: { control: false },
    validate: { control: false },
    onFilesChange: { control: false },
    onFilesReject: { control: false },
    messages: { control: false },
    render: { control: false },
  },
  args: { locale: 'sv' },
  parameters: { a11yContract: contract },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => <FileUploadField {...args} locale={localeOf(globals)} />,
} satisfies Meta<typeof FileUploadField>

export default meta
type Story = StoryObj<typeof meta>

/** The hidden native input of the field in the canvas. */
const inputOf = (canvasElement: HTMLElement) => {
  const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')
  if (input === null) {
    throw new Error('no file input')
  }
  return input
}

/** The items of the list: refused files are never among them. */
const itemsOf = (canvasElement: HTMLElement) => [
  ...canvasElement.querySelectorAll<HTMLElement>('li[data-status]'),
]

/**
 * The Trigger, found by its class: its text is the first part of its name, so a role query by
 * name would need the locale's own wording.
 */
const triggerOf = (canvasElement: HTMLElement) => {
  const trigger = canvasElement.querySelector<HTMLElement>('.kv-file-upload-trigger')
  if (trigger === null) {
    throw new Error('no Trigger')
  }
  return trigger
}

/**
 * Chooses files without the dialog's own `accept` filter: a drop and "All files" skip it, so the
 * component has to check every file itself.
 */
const choose = (canvasElement: HTMLElement, ...files: File[]) =>
  userEvent.setup({ applyAccept: false }).upload(inputOf(canvasElement), files)

/**
 * Empty. One button opens the system dialog and is the way in. Its name is its own text, then the
 * Field label, so voice users say "Välj filer". The limits are in its description, so they are
 * said before anyone chooses a file.
 */
export const Default: Story = {
  args: { multiple: true, maxFiles: 5, accept: '.pdf,.jpg,.png', maxFileSize: 10_000_000 },
  play: async ({ canvasElement, globals }) => {
    const { texts } = fileUploadTextsFor(localeOf(globals))
    const trigger = triggerOf(canvasElement)
    await expect(trigger).toHaveAccessibleName(
      new RegExp(`^${localeOf(globals) === 'sv' ? 'Välj filer' : 'Choose files'}.*${texts.label}`),
    )
    await expect(itemsOf(canvasElement)).toHaveLength(0)
    await expectMinimumTargetSize(trigger)
  },
}

/** One file, not several: a new file replaces the old one, and the button says "Byt fil". */
export const SingleFile: Story = {
  args: { multiple: false, accept: '.pdf' },
  play: async ({ canvasElement }) => {
    await choose(canvasElement, makeFile('intyg.pdf'))
    await choose(canvasElement, makeFile('nytt-intyg.pdf', 30_000))
    await expect(itemsOf(canvasElement)).toHaveLength(1)
    await expect(itemsOf(canvasElement)[0]).toHaveTextContent('nytt-intyg.pdf')
  },
}

/** Files added, with the form as their destination (no `upload`): ready, and posted with it. */
export const WithFiles: Story = {
  args: { multiple: true, maxFiles: 5, inputName: 'attachments' },
  play: async ({ canvasElement }) => {
    await choose(
      canvasElement,
      makeFile('läkarintyg.pdf', 240_000),
      makeFile('kvitto-1.jpg', 1_800_000, 'image/jpeg'),
      makeFile('kvitto-2.jpg', 2_400_000, 'image/jpeg'),
    )
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(3))
    for (const item of itemsOf(canvasElement)) {
      await expect(item).toHaveAttribute('data-status', 'pending')
    }
  },
}

/** Uploading with a known size: a native progress bar and the percentage as text. Only Cancel. */
export const Uploading: Story = {
  args: { multiple: true, upload: controlledUpload('known') },
  play: async ({ canvas, canvasElement }) => {
    await choose(canvasElement, makeFile('läkarintyg.pdf', 240_000))
    const bar = await canvas.findByRole('progressbar')
    await expect(bar).toHaveAccessibleName(/läkarintyg\.pdf/)
    await expect(itemsOf(canvasElement)[0]).toHaveAttribute('data-status', 'uploading')
  },
}

/** Uploading with no known size: a static hatched bar, nothing moves (2.2.2). */
export const UploadingUnknownSize: Story = {
  args: { multiple: true, upload: controlledUpload('unknown') },
  play: async ({ canvas, canvasElement }) => {
    await choose(canvasElement, makeFile('läkarintyg.pdf'))
    const bar = await canvas.findByRole('progressbar')
    await expect(bar).not.toHaveAttribute('value')
  },
}

/** Finished: no progress bar is left in the tree, and the status says so in text. */
export const Complete: Story = {
  args: { multiple: true, upload: controlledUpload('succeed') },
  play: async ({ canvasElement }) => {
    await choose(canvasElement, makeFile('läkarintyg.pdf'))
    await waitFor(() =>
      expect(itemsOf(canvasElement)[0]).toHaveAttribute('data-status', 'complete'),
    )
  },
}

/** A failed upload says so in neutral words, and Retry reuses the stored file. */
export const Failed: Story = {
  args: { multiple: true, upload: controlledUpload('fail') },
  play: async ({ canvasElement }) => {
    await choose(canvasElement, makeFile('läkarintyg.pdf'))
    await waitFor(() => expect(itemsOf(canvasElement)[0]).toHaveAttribute('data-status', 'failed'))
  },
}

/** Cancelled by the user: the file stays, with Retry and Remove, so a mistake costs one press. */
export const Cancelled: Story = {
  args: { multiple: true, upload: controlledUpload('unknown') },
  play: async ({ canvas, canvasElement }) => {
    await choose(canvasElement, makeFile('läkarintyg.pdf'))
    await userEvent.click(await canvas.findByRole('button', { name: /läkarintyg\.pdf/ }))
    await waitFor(() =>
      expect(itemsOf(canvasElement)[0]).toHaveAttribute('data-status', 'cancelled'),
    )
  },
}

/**
 * Refused files: the wrong type, too large, empty. None enters the list. Each is named under the
 * button with how to fix it, and the Field is not marked invalid by it.
 */
export const Rejected: Story = {
  args: { multiple: true, accept: '.pdf', maxFileSize: 1_000_000 },
  play: async ({ canvasElement }) => {
    await choose(
      canvasElement,
      makeFile('bild.png', 5_000, 'image/png'),
      makeFile('stor.pdf', 2_000_000),
      makeFile('tom.pdf', 0),
      makeFile('bra.pdf', 40_000),
    )
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(1))
    await expect(canvasElement.querySelector('.kv-file-upload-rejections')).toHaveTextContent(
      'bild.png',
    )
  },
}

/** The list is full: the button stays focusable but says why it does nothing. */
export const LimitReached: Story = {
  args: { multiple: true, maxFiles: 2 },
  play: async ({ canvasElement }) => {
    await choose(canvasElement, makeFile('a.pdf', 1_000), makeFile('b.pdf', 2_000))
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(2))
  },
}

/** Image previews: a decorative thumbnail from an object URL, revoked when the item goes away. */
export const WithPreview: Story = {
  args: { multiple: true, previews: true },
  play: async ({ canvasElement }) => {
    await choose(canvasElement, makeImage('foto.png'), makeFile('intyg.pdf'))
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(2))
    for (const image of canvasElement.querySelectorAll('li img')) {
      await expect(image).toHaveAttribute('alt', '')
    }
  },
}

/** Twelve files: the list reflows and the summary counts them. */
export const ManyFiles: Story = {
  args: { multiple: true, maxFiles: 15 },
  play: async ({ canvasElement }) => {
    await choose(
      canvasElement,
      ...Array.from({ length: 12 }, (_, index) =>
        makeFile(`kvitto-${index + 1}.pdf`, 1_000 + index),
      ),
    )
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(12))
  },
}

/** Long names wrap anywhere, so a 120-character file name doesn't scroll sideways at 320px. */
export const LongNames: Story = {
  args: { multiple: true },
  render: (args, { globals }) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <FileUploadField {...args} locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await choose(
      canvasElement,
      makeFile(`${'kuntaliitoksenjälkeinenasumistukihakemuksenliiteasiakirja'.repeat(2)}.pdf`),
    )
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(1))
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Disabled: the button and the input are native `disabled`, and no item has a button. */
export const Disabled: Story = {
  args: { multiple: true, disabled: true },
  play: async ({ canvasElement }) => {
    await expect(triggerOf(canvasElement)).toBeDisabled()
  },
}

/**
 * A file is dragged over the zone: the edge turns solid with a tint, and the hint says what
 * dropping does. The play dispatches the drag and leaves it there, so every theme checks this
 * state. Dragging is only ever an extra: the button is the way in.
 */
export const Dragging: Story = {
  args: { multiple: true, maxFiles: 5, accept: '.pdf' },
  play: async ({ canvasElement }) => {
    const zone = canvasElement.querySelector<HTMLElement>('.kv-file-upload-drop-zone')
    if (zone === null) {
      throw new Error('no drop zone')
    }
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(makeFile('läkarintyg.pdf'))
    for (const type of ['dragenter', 'dragover']) {
      zone.dispatchEvent(new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true }))
    }
    await waitFor(() => expect(zone).toHaveAttribute('data-dragging'))
  },
}

/** The consumer marks the Field invalid and writes the message: the Trigger is described by it. */
export const Invalid: Story = {
  args: { multiple: true, invalid: true },
  play: async ({ canvasElement }) => {
    const trigger = triggerOf(canvasElement)
    await expect(trigger).toHaveAttribute('aria-invalid', 'true')
  },
}

/** A required Field: the Trigger never carries `aria-required` (a button doesn't allow it). */
export const Required: Story = {
  args: { multiple: true, required: true },
}

/** Right to left, in English: the list, the status bar and the buttons mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  args: { multiple: true, upload: controlledUpload('known') },
  play: async ({ canvasElement }) => {
    await choose(
      canvasElement,
      makeFile('report.pdf'),
      makeFile('receipt.jpg', 90_000, 'image/jpeg'),
    )
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(2))
  },
}

/** Every state in one column. The theme marks them with text and shape, not only colour. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { multiple: true, upload: controlledUpload('known'), maxFiles: 3, accept: '.pdf' },
  play: async ({ canvasElement }) => {
    await choose(canvasElement, makeFile('a.pdf'), makeFile('b.png', 100, 'image/png'))
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(1))
  },
}

/**
 * The fixture the keyboard tests drive: the field, then a Send button. Tab to the button, press
 * Enter or Space to open the system dialog, choose files, Tab to an item's button. Removing an item
 * moves focus to the next item, never to the page.
 */
export const Keyboard: Story = {
  args: { multiple: true, maxFiles: 5, withSubmit: true },
  play: async ({ canvasElement }) => {
    await expect(triggerOf(canvasElement)).toBeVisible()
  },
}
