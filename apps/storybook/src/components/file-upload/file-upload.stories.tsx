import { FileUpload } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/file-upload/file-upload.a11y.md?raw'
import guide from '../../../../../packages/react/src/file-upload/file-upload.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  AttachmentsField,
  AttachmentsPostedWithTheForm,
  AttachmentsSentByHand,
  AttachmentsWithFailureReasons,
  AttachmentsWithOwnChecks,
  AttachmentsWithOwnWords,
  AttachmentsWithPreviews,
  AttachmentsWithSendButton,
  controlledUpload,
  fileUploadTextsFor,
  InvalidAttachments,
  makeFile,
  makeImage,
  RequiredAttachments,
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
// consumer, who decides whether a refused file blocks the form.

/** The trigger's own text per locale. */
const chooseFiles: Record<FormLocale, string> = {
  sv: 'Välj filer',
  fi: 'Valitse tiedostot',
  nb: 'Velg filer',
  nn: 'Vel filer',
  en: 'Choose files',
}

const meta = {
  title: 'Components/Forms/FileUpload',
  component: FileUpload.Root,
  // Every option at its default, so the main example starts where an adopter starts.
  args: {
    multiple: true,
    allowDuplicates: false,
    concurrency: 3,
    autoUpload: true,
    previews: false,
    disabled: false,
    onFilesChange: fn(),
    onFilesReject: fn(),
  },
  // Every prop in file-upload.tsx and use-file-upload.ts. The other parts take no options of their
  // own: see the API section for each part and the message keys.
  argTypes: {
    accept: {
      control: 'text',
      description:
        'Accepted types: extensions (`.pdf`), MIME types and wildcards (`image/*`), comma separated. Checked here too, because a drop skips the dialog’s filter.',
    },
    multiple: {
      control: 'boolean',
      description: 'Default `true`. Off: a new file replaces the current one.',
    },
    maxFiles: {
      control: 'number',
      description: 'How many files the list holds. At the limit the Trigger is `aria-disabled`.',
    },
    maxFileSize: { control: 'number', description: 'Largest file, in bytes.' },
    minFileSize: { control: 'number', description: 'Smallest file, in bytes.' },
    allowDuplicates: {
      control: 'boolean',
      description: 'Default `false`: the same name, size and last-modified time is refused.',
    },
    concurrency: { control: 'number', description: 'Uploads at once. Default 3.' },
    autoUpload: {
      control: 'boolean',
      description: 'Default `true`: uploads start when files are added.',
    },
    previews: {
      control: 'boolean',
      description:
        'Make an object URL for every image in the Root. `FileUpload.Preview` makes its own when this is off.',
    },
    disabled: {
      control: 'boolean',
      description:
        'Native `disabled` on the Trigger and the input. A disabled Field disables it too.',
    },
    upload: {
      control: false,
      description:
        '`(file, { signal, onProgress }) => Promise<result>`: your own function. Without it, files stay `pending` and go with the form.',
    },
    validate: {
      control: false,
      description:
        '`(file) => string | void`. A string refuses the file and is shown as its message.',
    },
    onFilesChange: {
      control: false,
      description: 'Called with the list when it changes. Not on every progress step.',
    },
    onFilesReject: {
      control: false,
      description: 'Called with the reasons (data, not text) when files were refused.',
    },
    messages: {
      control: false,
      description: 'Per-instance overrides for the `fileUpload` message keys.',
    },
    ref: { control: false, description: 'A ref to the Root `<div>`.' },
  },
  globals: { locale: 'sv' },
  parameters: {
    a11yContract: contract,
    docs: {
      description: { component: usageGuide(guide) },
      ...showSource('file-upload/file-upload.fixture.tsx', 'AttachmentsField').docs,
    },
  },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => <AttachmentsField {...args} locale={localeOf(globals)} />,
} satisfies Meta<typeof FileUpload.Root>

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

/** The `data-status` of every item, in list order. */
const statusesOf = (canvasElement: HTMLElement) =>
  itemsOf(canvasElement).map((item) => item.dataset['status'])

/** The Root and the drop zone of the field in the canvas. */
const rootOf = (canvasElement: HTMLElement) => {
  const root = canvasElement.querySelector<HTMLElement>('.kv-file-upload')
  if (root === null) {
    throw new Error('no Root')
  }
  return root
}
const dropZoneOf = (canvasElement: HTMLElement) => {
  const zone = canvasElement.querySelector<HTMLElement>('.kv-file-upload-drop-zone')
  if (zone === null) {
    throw new Error('no drop zone')
  }
  return zone
}

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
 * The main example: empty, with every option as a control. One button opens the system dialog and
 * is the way in. Its name is its own text, then the
 * Field label, so voice users say "Välj filer". The limits are in its description, so they are
 * said before anyone chooses a file.
 */
export const Default: Story = {
  args: { multiple: true, maxFiles: 5, accept: '.pdf,.jpg,.png', maxFileSize: 10_000_000 },
  play: async ({ canvasElement, globals }) => {
    const { texts } = fileUploadTextsFor(localeOf(globals))
    const trigger = triggerOf(canvasElement)
    await expect(trigger).toHaveAccessibleName(
      new RegExp(`^${chooseFiles[localeOf(globals)]}.*${texts.label}`),
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
  parameters: showSource('file-upload/file-upload.fixture.tsx', 'AttachmentsPostedWithTheForm'),
  render: (args, { globals }) => (
    <AttachmentsPostedWithTheForm {...args} locale={localeOf(globals)} />
  ),
  args: { multiple: true, maxFiles: 5 },
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

/** Uploading with no known size: a decorative moving track, no `<progress>` (loops while the upload runs, still under reduced motion). */
export const UploadingUnknownSize: Story = {
  args: { multiple: true, upload: controlledUpload('unknown') },
  play: async ({ canvas, canvasElement }) => {
    await choose(canvasElement, makeFile('läkarintyg.pdf'))
    await waitFor(() => expect(canvasElement.querySelector('.kv-progress-track')).not.toBeNull())
    await expect(canvasElement.querySelector('.kv-progress-track')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    await expect(canvas.queryByRole('progressbar')).toBeNull()
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

/**
 * The other reasons a file is refused: smaller than `minFileSize`, more than `maxFiles`, a copy of
 * a file already in the list, a folder, and your own `validate`, whose message is shown as it is.
 * Each is named under the button with how to fix it, and none enters the list. The play marks a
 * file as a folder the way a drop does (`isDirectory`), because a script can't drop a real one.
 */
export const RejectedForOtherReasons: Story = {
  parameters: showSource('file-upload/file-upload.fixture.tsx', 'AttachmentsWithOwnChecks'),
  render: (args, { globals }) => <AttachmentsWithOwnChecks {...args} locale={localeOf(globals)} />,
  args: { multiple: true, minFileSize: 10_000, maxFiles: 2 },
  play: async ({ canvasElement, globals }) => {
    const { texts } = fileUploadTextsFor(localeOf(globals))
    const folder = Object.defineProperty(makeFile('mapp', 20_000), 'isDirectory', { value: true })
    const kept = makeFile('läkarintyg.pdf', 20_000)
    await choose(
      canvasElement,
      makeFile('liten.pdf', 500),
      folder,
      makeFile('mitt intyg.pdf', 20_000),
      kept,
      kept,
      makeFile('kvitto.pdf', 20_000),
      makeFile('extra.pdf', 20_000),
    )
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(2))
    const rejections = canvasElement.querySelector('.kv-file-upload-rejections')
    await expect(rejections?.querySelectorAll('li')).toHaveLength(5)
    await expect(rejections).toHaveTextContent(texts.nameWithSpaces)
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

/**
 * Uploads that start when you say so: `autoUpload` is off, so every file waits as `pending`, and
 * `uploadAll()` starts them, here one at a time (`concurrency={1}`) while the others wait for a
 * slot. No part exposes `uploadAll()`, so this one builds its elements from `useFileUpload`.
 */
export const UploadAllByHand: Story = {
  parameters: showSource(
    'file-upload/file-upload.fixture.tsx',
    'AttachmentsSentByHand',
    'QueuedAttachments',
  ),
  render: (_args, { globals }) => <AttachmentsSentByHand locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement, globals }) => {
    const { texts } = fileUploadTextsFor(localeOf(globals))
    await choose(
      canvasElement,
      makeFile('a.pdf', 1_000),
      makeFile('b.pdf', 2_000),
      makeFile('c.pdf', 3_000),
    )
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(3))
    await expect(statusesOf(canvasElement)).toEqual(['pending', 'pending', 'pending'])
    await userEvent.click(canvas.getByRole('button', { name: texts.submit }))
    await waitFor(() =>
      expect(statusesOf(canvasElement)).toEqual(['uploading', 'pending', 'pending']),
    )
  },
}

/**
 * Why an upload failed. `FileUpload.ItemError` states the reason in the item. The PDF fails the
 * ordinary way: a neutral sentence and Retry. The photo is refused for good by the server: it
 * rejects with `retryable: false` and its own message, and only Remove is left.
 */
export const FailureReasons: Story = {
  parameters: showSource('file-upload/file-upload.fixture.tsx', 'AttachmentsWithFailureReasons'),
  render: (args, { globals }) => (
    <AttachmentsWithFailureReasons {...args} locale={localeOf(globals)} />
  ),
  args: { multiple: true },
  play: async ({ canvasElement, globals }) => {
    const { texts } = fileUploadTextsFor(localeOf(globals))
    await choose(
      canvasElement,
      makeFile('läkarintyg.pdf'),
      makeFile('foto.jpg', 90_000, 'image/jpeg'),
    )
    await waitFor(() => expect(statusesOf(canvasElement)).toEqual(['failed', 'failed']))
    const errors = canvasElement.querySelectorAll('.kv-file-upload-item-error')
    await expect(errors).toHaveLength(2)
    await expect(errors[1]).toHaveTextContent(texts.notAccepted('foto.jpg'))
    // Retry only where trying again can help.
    await expect(canvasElement.querySelectorAll('.kv-file-upload-retry')).toHaveLength(1)
    await expect(canvasElement.querySelectorAll('.kv-file-upload-remove')).toHaveLength(2)
  },
}

/**
 * Your own words: `messages` replaces the Trigger's text and the Remove button's text and name for
 * this one upload. The name still starts with the visible text (2.5.3), because `remove` and
 * `removeFile` change together.
 */
export const OwnWords: Story = {
  parameters: showSource('file-upload/file-upload.fixture.tsx', 'AttachmentsWithOwnWords'),
  render: (args, { globals }) => <AttachmentsWithOwnWords {...args} locale={localeOf(globals)} />,
  args: { multiple: true },
  play: async ({ canvas, canvasElement, globals }) => {
    const { texts } = fileUploadTextsFor(localeOf(globals))
    await expect(triggerOf(canvasElement)).toHaveAccessibleName(
      new RegExp(`^${texts.ownChooseFiles}`),
    )
    await choose(canvasElement, makeFile('läkarintyg.pdf'))
    await waitFor(() => expect(itemsOf(canvasElement)).toHaveLength(1))
    await expect(
      canvas.getByRole('button', { name: `${texts.ownRemove} läkarintyg.pdf` }),
    ).toBeVisible()
  },
}

/** Image previews: a decorative thumbnail from an object URL, revoked when the item goes away. */
export const WithPreview: Story = {
  parameters: showSource('file-upload/file-upload.fixture.tsx', 'AttachmentsWithPreviews'),
  render: (args, { globals }) => <AttachmentsWithPreviews {...args} locale={localeOf(globals)} />,
  args: { multiple: true },
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
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
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
 * dropping does. The zone has `data-dragging` and the Root `data-drag-active`. The play dispatches
 * the drag and leaves it there, so every theme checks this state. Dragging is only ever an extra:
 * the button is the way in.
 */
export const Dragging: Story = {
  args: { multiple: true, maxFiles: 5, accept: '.pdf' },
  play: async ({ canvasElement }) => {
    const zone = dropZoneOf(canvasElement)
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(makeFile('läkarintyg.pdf'))
    for (const type of ['dragenter', 'dragover']) {
      zone.dispatchEvent(new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true }))
    }
    await waitFor(() => expect(zone).toHaveAttribute('data-dragging'))
    await expect(zone).toHaveAttribute('data-droppable')
    await expect(rootOf(canvasElement)).toHaveAttribute('data-drag-active')
  },
}

/**
 * A file is dragged over the page, not yet over the zone. The Root has `data-drag-active` and the
 * zone is drawn (`data-droppable`), which is how a device without a precise pointer finds it, but
 * the zone is not `data-dragging` until the file is over it.
 */
export const DraggedOverThePage: Story = {
  args: { multiple: true, maxFiles: 5, accept: '.pdf' },
  play: async ({ canvasElement }) => {
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(makeFile('läkarintyg.pdf'))
    canvasElement.ownerDocument.body.dispatchEvent(
      new DragEvent('dragover', { dataTransfer, bubbles: true, cancelable: true }),
    )
    await waitFor(() => expect(rootOf(canvasElement)).toHaveAttribute('data-drag-active'))
    await expect(dropZoneOf(canvasElement)).toHaveAttribute('data-droppable')
    await expect(dropZoneOf(canvasElement)).not.toHaveAttribute('data-dragging')
  },
}

/** The consumer marks the Field invalid and writes the message: the Trigger is described by it. */
export const Invalid: Story = {
  parameters: showSource('file-upload/file-upload.fixture.tsx', 'InvalidAttachments'),
  render: (args, { globals }) => <InvalidAttachments {...args} locale={localeOf(globals)} />,
  args: { multiple: true },
  play: async ({ canvasElement }) => {
    const trigger = triggerOf(canvasElement)
    await expect(trigger).toHaveAttribute('aria-invalid', 'true')
  },
}

/** A required Field: the Trigger never carries `aria-required` (a button doesn't allow it). */
export const Required: Story = {
  parameters: showSource('file-upload/file-upload.fixture.tsx', 'RequiredAttachments'),
  render: (args, { globals }) => <RequiredAttachments {...args} locale={localeOf(globals)} />,
  args: { multiple: true },
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
  parameters: showSource('file-upload/file-upload.fixture.tsx', 'AttachmentsWithSendButton'),
  render: (args, { globals }) => <AttachmentsWithSendButton {...args} locale={localeOf(globals)} />,
  args: { multiple: true, maxFiles: 5 },
  play: async ({ canvasElement }) => {
    await expect(triggerOf(canvasElement)).toBeVisible()
  },
}
