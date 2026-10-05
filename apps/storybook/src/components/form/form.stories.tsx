import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/react/src/fieldset/fieldset.a11y.md?raw'
import guide from '../../../../../packages/react/src/field/form.md?raw'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { choiceTextsFor } from './choice.fixture.tsx'
import { localeOf, textsFor, withFormLocale } from './form.fixture.tsx'
import { permitTextsFor, PermitForm } from './permit.fixture.tsx'

// Components/Form/Overview: "Apply for a resident parking permit", a short form with every
// control (design spec docs/design/form-fields.md §5): a text field, a date, a field with a help text
// above and an example under, an email, an optional phone number, a radio group, a checkbox
// group, a declaration and a button. One column, `novalidate`, so the browser's own bubbles never
// replace our errors. It is a component showcase: a real resident service asks one thing per
// page. KvirnUI holds no form state and validates nothing: the `errors` story sets `invalid`
// itself, as the form's logic would after a submit. On submit, move focus to the first invalid
// field, and let the page set `scroll-padding-block-end` so the message under it is not hidden.
// The contract is fieldset.a11y.md: the form is made of controls whose keys are documented in
// their own contracts, and Tab walks them in reading order.

const meta = {
  title: 'Components/Form/Overview',
  globals: { locale: 'sv' },
  decorators: [withFormLocale],
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every control in one form: text, date, help texts, email, optional phone, radios, checkboxes. */
export const ShortForm: Story = {
  parameters: showSource('form/permit.fixture.tsx', 'PermitForm'),
  render: (_args, { globals }) => <PermitForm locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = textsFor(locale)
    const { text: choice } = choiceTextsFor(locale)
    await expect(
      canvas.getByRole('heading', { level: 1, name: permitTextsFor(locale).heading }),
    ).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: text.name })).toHaveAttribute(
      'autocomplete',
      'name',
    )
    // The three groups of the form: a date, a radio group and a checkbox group.
    await expect(canvas.getAllByRole('group')).toHaveLength(3)
    await expect(canvas.getAllByRole('radio')).toHaveLength(3)
    await expect(canvas.getAllByRole('checkbox')).toHaveLength(4)
    await expect(canvas.getByRole('checkbox', { name: choice.declaration })).toBeVisible()
    await expect(canvas.getAllByRole('textbox')).toHaveLength(7)
    for (const textbox of canvas.getAllByRole('textbox')) {
      await expect(textbox).not.toHaveAttribute('aria-invalid')
    }
  },
}

/**
 * The fixture the keyboard tests drive: the same form, with a count of submits. Try the keys in
 * the Keyboard section above: Tab walks the controls in reading order (a date is three stops, a
 * radio group one, each checkbox its own).
 */
export const Keyboard: Story = {
  parameters: showSource('form/permit.fixture.tsx', 'PermitForm'),
  render: (_args, { globals }) => <PermitForm locale={localeOf(globals)} showSubmits />,
}

/**
 * After a submit that failed: the name, the year, the duration and the declaration are wrong,
 * each with its message under its control, and only the Year box is marked in the date.
 */
export const ShortFormWithErrors: Story = {
  parameters: showSource('form/permit.fixture.tsx', 'PermitForm'),
  render: (_args, { globals }) => <PermitForm locale={localeOf(globals)} errors />,
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvasElement.querySelectorAll('.kv-field-error-message')).toHaveLength(4)
    await expect(canvas.getByRole('textbox', { name: text.name })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await expect(canvasElement.querySelectorAll('input[aria-invalid="true"]')).toHaveLength(3)
  },
}

/** Finnish, the longest strings: a 320px column wraps and nothing overflows. */
export const Finnish: Story = {
  globals: { locale: 'fi' },
  parameters: showSource('form/permit.fixture.tsx', 'PermitForm'),
  render: (_args, { globals }) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <PermitForm locale={localeOf(globals)} errors />
    </div>
  ),
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Staff density from 64rem: 32px controls and 14px labels, the typed text still 16px. */
export const Compact: Story = {
  parameters: showSource('form/permit.fixture.tsx', 'PermitForm'),
  render: (_args, { globals }) => (
    <div className="kv-compact">
      <PermitForm locale={localeOf(globals)} />
    </div>
  ),
}

/** Right to left, in English: labels, boxes and marks mirror, and Tab follows the DOM. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('form/permit.fixture.tsx', 'PermitForm'),
  render: () => <PermitForm locale="en" errors />,
}

/** Every control, with its errors, in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('form/permit.fixture.tsx', 'PermitForm'),
  render: (_args, { globals }) => <PermitForm locale={localeOf(globals)} errors />,
}
