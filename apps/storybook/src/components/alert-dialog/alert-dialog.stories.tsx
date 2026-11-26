import { AlertDialog, Dialog } from '@kvirn/ui'
import contract from '../../../../../packages/react/src/alert-dialog/alert-dialog.a11y.md?raw'
import guide from '../../../../../packages/react/src/alert-dialog/alert-dialog.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import {
  DeleteDraftConfirmation,
  KeyboardAlertDialog,
  SessionTimeoutWarning,
} from './alert-dialog.fixture.tsx'

// Components/AlertDialog: a modal native <dialog role="alertdialog"> for a message that needs an
// answer (contract: alert-dialog.a11y.md). The default theme styles it as a Dialog.

const description = usageGuide(guide)

const source = (...names: string[]) => showSource('alert-dialog/alert-dialog.fixture.tsx', ...names)

const meta = {
  title: 'Components/Choice and overlays/AlertDialog',
  component: AlertDialog.Root,
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled: whether the alert dialog is open. Pair it with `onOpenChange`.',
    },
    defaultOpen: { control: 'boolean', description: 'Uncontrolled: whether it starts open.' },
    onOpenChange: {
      control: false,
      description:
        'Called with `(open, { reason, event })`: `trigger-press`, `close-press`, `escape` or `native-close`. It never reports `outside-press`: a press on the backdrop does nothing. With `open` set, you decide.',
    },
    initialFocusRef: {
      control: false,
      description:
        'A ref to where focus goes on open. Set it: the least destructive action, or the primary one when nothing is destroyed. A development warning fires without it.',
    },
    finalFocusRef: {
      control: false,
      description:
        'A ref to where focus goes on close. Default: the trigger, else what had focus before it opened. Pass it for one opened by a timer.',
    },
    children: { control: false, description: 'The Trigger and the Popup.' },
  },
  args: { defaultOpen: false, onOpenChange: fn() },
  globals: { locale: 'en' },
  decorators: [withFormLocale],
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof AlertDialog.Root>

export default meta
type Story = StoryObj<typeof meta>

const alertDialog = () => document.querySelector<HTMLDialogElement>('dialog.kv-alert-dialog:modal')

/**
 * The main example: confirm before deleting. The danger action is first, and focus starts on the
 * safe "Keep draft", so an accidental Enter changes nothing. Press the trigger, then Escape:
 * it keeps the draft.
 */
export const ConfirmDelete: Story = {
  parameters: source('DeleteDraftConfirmation'),
  render: (args, { globals }) => <DeleteDraftConfirmation {...args} locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delete the draft' }))
    await canvas.findByRole('alertdialog', { name: 'Delete the draft application?' })
  },
}

/**
 * The session timeout warning (B25). It opens from state, starts on the primary action, "Stay
 * signed in", and keeps the remaining time in a polite region that updates once a minute, then
 * every 20 seconds in the last minute. The clock time follows the locale (`useFormat()`).
 */
export const TimeoutWarning: Story = {
  parameters: source('SessionTimeoutWarning'),
  render: (_args, { globals }) => <SessionTimeoutWarning locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Show the warning' }))
    await canvas.findByRole('alertdialog', { name: 'Do you want to stay signed in?' })
    await expect(canvas.getByText('2 minutes left.')).toBeInTheDocument()
  },
}

/** Right to left, in English: the safe action keeps focus on open. */
export const Rtl: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: source('DeleteDraftConfirmation'),
  render: (args, { globals }) => <DeleteDraftConfirmation {...args} locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delete the draft' }))
    await canvas.findByRole('button', { name: 'Keep draft' })
  },
}

/** The alert dialog keeps a visible edge in forced colours: the open state is never colour alone. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: source('DeleteDraftConfirmation'),
  render: (args, { globals }) => <DeleteDraftConfirmation {...args} locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delete the draft' }))
    await waitFor(() => expect(alertDialog()).not.toBeNull())
  },
}

/**
 * The fixture the keyboard tests drive: a button before, the alert dialog, and a button after. Try
 * the keys in the Keyboard section above: Enter and Space on the trigger, Tab inside, and Escape.
 */
export const Keyboard: Story = {
  parameters: source('KeyboardAlertDialog'),
  render: (_args, { globals }) => <KeyboardAlertDialog locale={localeOf(globals)} />,
}

/** An alert dialog opened over a Dialog: both are modal, and the alert dialog is on top. */
export const OverADialog: Story = {
  render: () => (
    <Dialog.Root defaultOpen>
      <Dialog.Popup>
        <Dialog.Title>Edit application</Dialog.Title>
        <AlertDialog.Root defaultOpen>
          <AlertDialog.Popup>
            <AlertDialog.Title>Discard the changes?</AlertDialog.Title>
            <AlertDialog.Description>The changes are not saved.</AlertDialog.Description>
            <button type="button">Discard</button>
          </AlertDialog.Popup>
        </AlertDialog.Root>
      </Dialog.Popup>
    </Dialog.Root>
  ),
  play: async () => {
    await waitFor(() => expect(document.querySelectorAll('dialog:modal')).toHaveLength(2))
  },
}
