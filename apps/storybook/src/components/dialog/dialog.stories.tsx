import { Button, Dialog, Field, TextInput } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/dialog/dialog.a11y.md?raw'
import guide from '../../../../../packages/react/src/dialog/dialog.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ComboboxInDialog,
  ControlledDialog,
  KeyboardDialog,
  LongTerms,
  OpenedByAButton,
  PhoneNumberForm,
  PopoverInDialog,
  RemoveNumberOverDialog,
} from './dialog.fixture.tsx'

// Components/Dialog: a button that opens a modal native <dialog> (contract: dialog.a11y.md). The
// default theme styles the popup, the backdrop and the scroll lock.

const description = usageGuide(guide)

const source = (...names: string[]) => showSource('dialog/dialog.fixture.tsx', ...names)

const meta = {
  title: 'Components/Dialog',
  component: Dialog.Root,
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled: whether the dialog is open. Pair it with `onOpenChange`.',
    },
    defaultOpen: { control: 'boolean', description: 'Uncontrolled: whether it starts open.' },
    onOpenChange: {
      control: false,
      description:
        'Called with `(open, { reason, event })`: `trigger-press`, `close-press`, `escape`, `outside-press` or `native-close`. It only reports: with `open` set, you decide.',
    },
    initialFocusRef: {
      control: false,
      description:
        'A ref to where focus goes on open. Default: the first tabbable that is not Close, else the title.',
    },
    finalFocusRef: {
      control: false,
      description:
        'A ref to where focus goes on close. Default: the trigger, else what had focus before it opened.',
    },
    dismissOnOutsidePress: {
      control: 'boolean',
      description:
        'A press on the backdrop closes it (`outside-press`). Default `false`, so a stray tap never loses what someone typed.',
    },
    messages: {
      control: false,
      description: 'Overrides for `close`, the name of an icon-only `Dialog.Close`.',
    },
    children: { control: false, description: 'The Trigger and the Popup.' },
  },
  args: { defaultOpen: false, dismissOnOutsidePress: false, onOpenChange: fn() },
  globals: { locale: 'sv' },
  decorators: [withFormLocale],
  // A short read: the title names it, Close is an icon button, and with no field inside focus
  // starts on the title.
  render: (args) => (
    <Dialog.Root {...args}>
      <Dialog.Trigger className="kv-button">Om e-tjänsten</Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Title>Om e-tjänsten</Dialog.Title>
        <Dialog.Close />
        <Dialog.Description>
          Tjänsten drivs av kommunen och är öppen dygnet runt.
        </Dialog.Description>
        <Dialog.Body>
          <p>Du kan spara din ansökan och fortsätta senare. Dina svar finns kvar i 30 dagar.</p>
        </Dialog.Body>
        <Dialog.Actions>
          <Button className="kv-button--primary">Kontakta oss</Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  ),
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof Dialog.Root>

export default meta
type Story = StoryObj<typeof meta>

const modalDialog = () => document.querySelector<HTMLDialogElement>('dialog.kv-dialog:modal')

/** The main example: a closed trigger that says it has a dialog (`aria-haspopup="dialog"`). */
export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Om e-tjänsten' })
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(trigger).not.toHaveAttribute('aria-expanded')
    await expect(modalDialog()).toBeNull()
  },
}

/**
 * Open: the page behind is inert and focus is on the first action, "Kontakta oss". Close comes
 * after the title in the DOM and is never the first focus.
 */
export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas }) => {
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    const dialog = canvas.getByRole('dialog', { name: 'Om e-tjänsten' })
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toHaveAccessibleDescription(
      'Tjänsten drivs av kommunen och är öppen dygnet runt.',
    )
    await expect(canvas.getByRole('button', { name: 'Kontakta oss' })).toHaveFocus()
    await expect(canvas.getByRole('button', { name: 'Stäng dialogrutan' })).toBeInTheDocument()
  },
}

/**
 * A form in a dialog. Initial focus goes to the first field, Enter in it submits, Save is the one
 * primary action, and Cancel and Escape keep what was typed.
 */
export const WithForm: Story = {
  parameters: source('PhoneNumberForm'),
  render: (_args, { globals }) => <PhoneNumberForm locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ändra telefonnummer' }))
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: /Telefonnummer/ })).toHaveFocus(),
    )
    await expect(canvas.getByRole('dialog', { name: 'Ändra telefonnummer' })).toBeInTheDocument()
    await userEvent.keyboard('070 123 45 67')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await userEvent.click(canvas.getByRole('button', { name: 'Ändra telefonnummer' }))
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    await expect(canvas.getByRole('textbox', { name: /Telefonnummer/ })).toHaveValue(
      '070 123 45 67',
    )
  },
}

/**
 * A dialog taller than the screen scrolls inside the popup (1.4.10), and a keyboard user reaches
 * the end with the arrow keys from the title or with Tab to the action.
 */
export const LongContent: Story = {
  parameters: source('LongTerms'),
  render: (_args, { globals }) => <LongTerms locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Läs villkoren' }))
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    const dialog = canvas.getByRole('dialog', { name: 'Villkor för e-tjänsten' })
    await expectNoHorizontalOverflow(dialog)
    await expect(canvas.getByRole('heading', { name: 'Villkor för e-tjänsten' })).toHaveFocus()
  },
}

/**
 * Controlled by your state: the dialog shows the `open` it is given and reports every request
 * through `onOpenChange(open, { reason, event })`. `dismissOnOutsidePress` is on here, so the
 * backdrop asks to close too.
 */
export const Controlled: Story = {
  parameters: source('ControlledDialog'),
  decorators: [
    (Story) => (
      <div style={{ display: 'grid', gap: 'var(--kv-space-3, 12px)', justifyItems: 'start' }}>
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => <ControlledDialog locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const reason = canvas.getByTestId('reason')
    await userEvent.click(canvas.getByRole('button', { name: 'Öppna från sidan' }))
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    await expect(canvas.getByTestId('state')).toHaveTextContent('öppen')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(reason).toHaveTextContent('escape')
    await userEvent.click(canvas.getByRole('button', { name: 'Visa kvittot' }))
    await waitFor(() => expect(reason).toHaveTextContent('trigger-press'))
    await userEvent.click(canvas.getByRole('button', { name: 'Stäng' }))
    await waitFor(() => expect(reason).toHaveTextContent('close-press'))
    await waitFor(() => expect(modalDialog()).toBeNull())
    await userEvent.click(canvas.getByRole('button', { name: 'Visa kvittot' }))
    await waitFor(() => expect(modalDialog()).not.toBeNull())
  },
}

/**
 * Opened by a button through state, with no `Dialog.Trigger`. There is no trigger to return to, so
 * `finalFocusRef` names the element that gets focus back.
 */
export const NoTrigger: Story = {
  parameters: source('OpenedByAButton'),
  render: (_args, { globals }) => <OpenedByAButton locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Visa kvittot' })
    await userEvent.click(button)
    await waitFor(() => expect(modalDialog()).not.toBeNull())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(button).toHaveFocus()
    await userEvent.click(button)
    await waitFor(() => expect(modalDialog()).not.toBeNull())
  },
}

/**
 * An AlertDialog over a Dialog. Escape closes the alert dialog only, and focus returns to the
 * button that opened it. Use it to confirm a destructive action taken inside a dialog.
 */
export const Nested: Story = {
  parameters: source('RemoveNumberOverDialog'),
  render: (_args, { globals }) => <RemoveNumberOverDialog locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ändra telefonnummer' }))
    const removeTrigger = await canvas.findByRole('button', { name: 'Ta bort telefonnumret' })
    await userEvent.click(removeTrigger)
    await expect(
      await canvas.findByRole('alertdialog', { name: 'Vill du ta bort telefonnumret?' }),
    ).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Behåll numret' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull())
    await expect(removeTrigger).toHaveFocus()
    await expect(canvas.getByRole('dialog', { name: 'Ändra telefonnummer' })).toBeInTheDocument()
  },
}

/** A Popover inside a dialog: Escape closes the popover first, and the next one closes the dialog. */
export const PopoverInside: Story = {
  parameters: source('PopoverInDialog'),
  render: (_args, { globals }) => <PopoverInDialog locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ändra telefonnummer' }))
    await userEvent.click(await canvas.findByRole('button', { name: 'Varför frågar vi?' }))
    await expect(
      await canvas.findByRole('dialog', { name: 'Varför frågar vi?' }),
    ).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() =>
      expect(canvas.queryByRole('dialog', { name: 'Varför frågar vi?' })).toBeNull(),
    )
    await expect(canvas.getByRole('dialog', { name: 'Ändra telefonnummer' })).toBeInTheDocument()
  },
}

/**
 * A Combobox inside a dialog. The provider's live regions are inert while a modal is open, so the
 * dialog hosts its own, and the result count is still announced.
 */
export const ComboboxInside: Story = {
  parameters: source('ComboboxInDialog'),
  render: (_args, { globals }) => <ComboboxInDialog locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Ändra telefonnummer' }))
    const input = await canvas.findByRole('combobox', { name: /Kommun/ })
    await userEvent.type(input, 'Ma')
    await expect(await canvas.findByRole('listbox')).toBeInTheDocument()
    await waitFor(() =>
      expect(document.querySelector('dialog.kv-dialog [aria-live="polite"]')?.textContent).toMatch(
        /\d/,
      ),
    )
  },
}

/** Right to left, in English: Close sits at the inline end and the actions start at the inline start. */
export const Rtl: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: (args) => (
    <Dialog.Root defaultOpen {...args}>
      <Dialog.Trigger className="kv-button">Change phone number</Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Title>Change phone number</Dialog.Title>
        <Dialog.Close />
        <Dialog.Description>
          We send a code by text message to confirm the number.
        </Dialog.Description>
        <Dialog.Body>
          <Field.Root required>
            <Field.Label>Phone number</Field.Label>
            <TextInput name="phone" type="tel" autoComplete="tel" />
          </Field.Root>
        </Dialog.Body>
        <Dialog.Actions>
          <Button type="submit" className="kv-button--primary">
            Save the number
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  ),
}

/** The dialog keeps a visible edge in forced colours: the open state is never colour alone. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  args: { defaultOpen: true },
}

/**
 * The fixture the keyboard tests drive: a button before, the dialog, and a button after. Try the
 * keys in the Keyboard section above: Enter and Space on the trigger, Tab inside, Escape and Close.
 */
export const Keyboard: Story = {
  parameters: source('KeyboardDialog'),
  render: (_args, { globals }) => <KeyboardDialog locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Ändra telefonnummer' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: /Telefonnummer/ })).toHaveFocus(),
    )
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Stäng' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(modalDialog()).toBeNull())
    await expect(trigger).toHaveFocus()
    await userEvent.keyboard(' ')
    await waitFor(() => expect(modalDialog()).not.toBeNull())
  },
}
