import { Button, Card, Field, Icon, InputGroup } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/input-group/input-group.a11y.md?raw'
import guide from '../../../../../packages/react/src/input-group/input-group.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { SearchBoxWithClear, SearchBoxWithIconOnlyClear } from './input-group.fixture.tsx'

// Components/Form/InputGroup: a TextInput with a unit, a symbol, a decorative icon or a button
// inside its box (design spec docs/design/form-fields.md §6.13). InputGroup.Root is
// the box: it draws the edge, the invalid and disabled state and the focus ring. InputGroup.Addon
// is a short unit or a decorative icon: `aria-hidden`, never focusable, so the label always
// carries the meaning ("Månadshyra i kronor", never "Månadshyra" plus a "kr" Addon). A real
// Button (clear, show password) goes directly in the Root, never in an Addon: it keeps its own
// name and Tab stop.
//
// KvirnUI holds no form state. The clear Button of SearchWithClear keeps the
// value in the fixture's `useState`, where your form library's state would live. Nothing here
// validates: an invalid story sets `invalid` itself. input-group.e2e.ts runs the focus ring,
// Tab order, RTL, forced-colours and reflow checks.

const meta = {
  title: 'Components/Form/InputGroup',
  component: InputGroup.Root,
  // Every prop in input-group.tsx. `InputGroup.Input` takes every TextInput prop, and
  // `InputGroup.Addon` is a `<span>` with the unit or the icon.
  argTypes: {
    invalid: {
      control: 'boolean',
      description: 'Default: the nearest Field’s `invalid`. `data-invalid` on the box.',
    },
    disabled: {
      control: 'boolean',
      description: 'Default: the nearest Field’s `disabled`. `data-disabled` on the box.',
    },
    className: {
      control: 'text',
      description: 'Your own classes, added to `kv-input-group`.',
    },
    render: { control: false, description: 'Another element for the box. It receives the state.' },
    ref: { control: false, description: 'A ref to the box `<div>`.' },
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.rentWithUnit}</Field.Label>
        <InputGroup.Root {...args}>
          <InputGroup.Input
            name="rent"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-10 kv-input--numeric"
          />
          <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>{text.rentUnitExample(amountExample)}</Field.HelpText>
      </Field.Root>
    )
  },
} satisfies Meta<typeof InputGroup.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The main example: a unit at the end, with the box's options as controls. The "kr" is `aria-hidden`, so the label says it, and the example under the
 * box is the only description. The width class stays on the Input, and the box fits around it.
 */
export const Suffix: Story = {
  play: async ({ canvas, globals }) => {
    const { text, amountExample } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rentWithUnit })
    await expect(input).toHaveAccessibleDescription(text.rentUnitExample(amountExample))
    // The unit is visual only: not in the name, not in the description, not in the tree.
    const unit = canvas.getByText(text.rentUnit)
    await expect(unit).toHaveAttribute('aria-hidden', 'true')
    await expect(unit).toBeVisible()
    await expectMinimumTargetSize(input)
  },
}

/**
 * The fixture the keyboard tests drive: a search with a value, so its clear Button is there. Try
 * the keys in the Keyboard section above: Tab goes to the input and then to the Button, Shift+Tab
 * goes back, and Enter or Space on the Button clears the search and moves focus to the input.
 * The icon is never a Tab stop, and a click on it focuses the input.
 */
export const Keyboard: Story = {
  parameters: showSource('input-group/input-group.fixture.tsx', 'SearchBoxWithClear'),
  render: (_args, { globals }) => (
    <SearchBoxWithClear locale={localeOf(globals)} initialValue="parkering" />
  ),
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('searchbox', { name: text.searchServices })).toHaveValue(
      'parkering',
    )
    await expect(canvas.getByRole('button', { name: text.searchClear })).toBeVisible()
  },
}

/** A percentage: the "%" at the end, a width of 4 characters. sv and fi write "75 %". */
export const Percentage: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.workTime}</Field.Label>
        <InputGroup.Root>
          <InputGroup.Input
            name="work-time"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-4 kv-input--numeric"
          />
          <InputGroup.Addon>{text.workTimeUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>{text.workTimeExample}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.workTime })
    await userEvent.type(input, '37,5')
    await expect(input).toHaveValue('37,5')
  },
}

/** A distance: "km" at the end, and a description above the box, because it's read before typing. */
export const Distance: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.distance}</Field.Label>
        <Field.Prose>
          <p>{text.distanceHint}</p>
        </Field.Prose>
        <InputGroup.Root>
          <InputGroup.Input
            name="distance"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-6 kv-input--numeric"
          />
          <InputGroup.Addon>{text.distanceUnit}</InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.distance })).toHaveAccessibleDescription(
      text.distanceHint,
    )
  },
}

/** A search with a decorative icon at the start: it repeats what the label says. Full width. */
export const SearchIcon: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label marker="none">{text.searchServices}</Field.Label>
        <InputGroup.Root>
          <InputGroup.Addon>
            <Icon name="search" size={5} />
          </InputGroup.Addon>
          <InputGroup.Input type="search" name="search" enterKeyHint="search" autoComplete="off" />
        </InputGroup.Root>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('searchbox', { name: text.searchServices })
    // Clicking the icon focuses the Input: the whole box is one target.
    const icon = canvas.getByRole('searchbox').closest('.kv-input-group')?.querySelector('svg')
    await userEvent.click(icon ?? input)
    await expect(input).toHaveFocus()
  },
}

/**
 * A search with a clear Button, which renders only when there is a value. The value lives in
 * this story's `useState`. Clearing moves focus to the Input.
 */
export const SearchWithClear: Story = {
  parameters: showSource('input-group/input-group.fixture.tsx', 'SearchBoxWithClear'),
  render: (_args, { globals }) => <SearchBoxWithClear locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('searchbox', { name: text.searchServices })
    await expect(canvas.queryByRole('button', { name: text.searchClear })).toBeNull()
    await userEvent.type(input, 'parkering')
    const clear = canvas.getByRole('button', { name: text.searchClear })
    await expectMinimumTargetSize(clear)
    await userEvent.click(clear)
    await expect(input).toHaveValue('')
    await expect(input).toHaveFocus()
    await expect(canvas.queryByRole('button', { name: text.searchClear })).toBeNull()
  },
}

/**
 * The icon-only clear Button, for staff tools and compact density: a button, not a form
 * control, so its name is an `aria-label` from the translations.
 */
export const SearchIconOnlyClear: Story = {
  decorators: [
    (Story) => (
      <div className="kv-compact">
        <Story />
      </div>
    ),
  ],
  parameters: showSource('input-group/input-group.fixture.tsx', 'SearchBoxWithIconOnlyClear'),
  render: (_args, { globals }) => (
    <SearchBoxWithIconOnlyClear locale={localeOf(globals)} initialValue="parkering" />
  ),
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const clear = canvas.getByRole('button', { name: text.searchClearName })
    await expectMinimumTargetSize(clear)
    await userEvent.click(clear)
    await expect(canvas.getByRole('searchbox', { name: text.searchServices })).toHaveFocus()
  },
}

/**
 * A single text field with a decorative calendar icon. The icon opens nothing until the
 * DatePicker (M4) replaces it with a named button, so clicking it only focuses the Input. No
 * `inputMode="numeric"`: the number pad has no "-" or "." for the separators.
 */
export const CalendarIcon: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.visitDate}</Field.Label>
        <InputGroup.Root>
          <InputGroup.Input
            name="visit-date"
            autoComplete="off"
            spellCheck={false}
            className="kv-input--width-10 kv-input--numeric"
          />
          <InputGroup.Addon>
            <Icon name="calendar" size={5} />
          </InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>{text.visitDateExample}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.visitDate })
    await expect(input).not.toHaveAttribute('inputmode')
    await expect(input).toHaveAccessibleDescription(text.visitDateExample)
  },
}

/**
 * Invalid: a 2px `danger` edge on the box and the error under the example, never colour alone.
 * The typed text doesn't move.
 */
export const Invalid: Story = {
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.rentWithUnit}</Field.Label>
        <InputGroup.Root>
          <InputGroup.Input
            name="rent"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            defaultValue="8450"
            className="kv-input--width-10 kv-input--numeric"
          />
          <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>{text.rentUnitExample(amountExample)}</Field.HelpText>
        <Field.ErrorMessage>{text.rentError(amountExample)}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text, amountExample } = textsFor(locale)
    const input = canvas.getByRole('textbox', { name: text.rentWithUnit })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input.closest('.kv-input-group')).toHaveAttribute('data-invalid')
    // The amount's thousands separator is a no-break space, which Testing Library's matcher
    // normalises to a plain space in the page text but not in the string we pass.
    await expect(canvas.getByText(text.rentError(amountExample).replace(/\s+/g, ' '))).toBeVisible()
  },
}

/**
 * Without a Field: `invalid` and `disabled` on the Root draw the box's edge (`data-invalid`,
 * `data-disabled`), and everything else is yours. Name the Input with a native `<label for>`,
 * mark it with `aria-invalid` or native `disabled`, and point `aria-describedby` at the message.
 * Inside a Field, the Field does all of this and the Root follows it.
 */
export const WithoutField: Story = {
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <div lang={lang}>
        <label htmlFor="rent-without-field" className="kv-field-label">
          {text.rentWithUnit}
        </label>
        <InputGroup.Root invalid>
          <InputGroup.Input
            id="rent-without-field"
            name="rent"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            defaultValue="8450"
            aria-invalid="true"
            aria-describedby="rent-without-field-error"
            className="kv-input--width-10 kv-input--numeric"
          />
          <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <p id="rent-without-field-error">{text.rentError(amountExample)}</p>
        <label htmlFor="distance-without-field" className="kv-field-label">
          {text.distance}
        </label>
        <InputGroup.Root disabled>
          <InputGroup.Input
            id="distance-without-field"
            name="distance"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            defaultValue="12"
            disabled
            className="kv-input--width-6 kv-input--numeric"
          />
          <InputGroup.Addon>{text.distanceUnit}</InputGroup.Addon>
        </InputGroup.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text, amountExample } = textsFor(localeOf(globals))
    const invalid = canvas.getByRole('textbox', { name: text.rentWithUnit })
    await expect(invalid.closest('.kv-input-group')).toHaveAttribute('data-invalid')
    await expect(invalid).toHaveAccessibleDescription(text.rentError(amountExample))
    const disabled = canvas.getByRole('textbox', { name: text.distance })
    await expect(disabled).toBeDisabled()
    await expect(disabled.closest('.kv-input-group')).toHaveAttribute('data-disabled')
  },
}

/** Disabled: a dashed edge on the surface colour, the unit and the value muted. */
export const Disabled: Story = {
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <>
        <Field.Root required disabled lang={lang}>
          <Field.Label>{text.rentWithUnit}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Input
              name="rent"
              inputMode="decimal"
              spellCheck={false}
              autoComplete="off"
              defaultValue="8450"
              className="kv-input--width-10 kv-input--numeric"
            />
            <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
          </InputGroup.Root>
          <Field.HelpText>{text.rentUnitExample(amountExample)}</Field.HelpText>
        </Field.Root>
        <Field.Root disabled lang={lang}>
          <Field.Label marker="none">{text.searchServices}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Addon>
              <Icon name="search" size={5} />
            </InputGroup.Addon>
            <InputGroup.Input
              type="search"
              name="search"
              enterKeyHint="search"
              autoComplete="off"
              defaultValue="parkering"
            />
            <Button disabled>{text.searchClear}</Button>
          </InputGroup.Root>
        </Field.Root>
      </>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.rentWithUnit })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: text.searchClear })).toBeDisabled()
  },
}

/** Read-only, in staff tools: a solid edge on the surface colour, and still focusable. */
export const ReadOnly: Story = {
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.rentWithUnit}</Field.Label>
        <InputGroup.Root>
          <InputGroup.Input
            name="rent"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            readOnly
            defaultValue="8450"
            className="kv-input--width-10 kv-input--numeric"
          />
          <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Field.HelpText>{text.rentUnitExample(amountExample)}</Field.HelpText>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.rentWithUnit })
    await expect(input).toHaveAttribute('readonly')
    input.focus()
    await expect(input).toHaveFocus()
  },
}

/** In a card: a `canvas` box on `surface-raised`, so the edge keeps 3:1 against it (1.4.11). */
export const InCard: Story = {
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <Card.Root>
        <Field.Root required invalid lang={lang}>
          <Field.Label>{text.rentWithUnit}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Input
              name="rent"
              inputMode="decimal"
              spellCheck={false}
              autoComplete="off"
              defaultValue="8450"
              className="kv-input--width-10 kv-input--numeric"
            />
            <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
          </InputGroup.Root>
          <Field.HelpText>{text.rentUnitExample(amountExample)}</Field.HelpText>
          <Field.ErrorMessage>{text.rentError(amountExample)}</Field.ErrorMessage>
        </Field.Root>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.rentWithUnit })).toBeVisible()
  },
}

/** A long Finnish label that carries the unit wraps and hyphenates in a 320px column. */
export const LongFinnishLabel: Story = {
  globals: { locale: 'fi' },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.grantWithUnit}</Field.Label>
        <InputGroup.Root>
          <InputGroup.Input
            name="grant"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-20 kv-input--numeric"
          />
          <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>
    )
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: /Haettavan asunnonmuutostyöavustuksen/ }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Staff density from 64rem: a 32px box, a 32px Button, and 16px values and units. */
export const Compact: Story = {
  decorators: [
    (Story) => (
      <div className="kv-compact kv-story-form">
        <Story />
      </div>
    ),
  ],
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <>
        <Field.Root required lang={lang}>
          <Field.Label>{text.rentWithUnit}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Input
              name="rent"
              inputMode="decimal"
              spellCheck={false}
              autoComplete="off"
              className="kv-input--width-10 kv-input--numeric"
            />
            <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
          </InputGroup.Root>
          <Field.HelpText>{text.rentUnitExample(amountExample)}</Field.HelpText>
        </Field.Root>
        <Field.Root lang={lang}>
          <Field.Label marker="none">{text.searchServices}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Addon>
              <Icon name="search" size={5} />
            </InputGroup.Addon>
            <InputGroup.Input
              type="search"
              name="search"
              enterKeyHint="search"
              autoComplete="off"
              defaultValue="parkering"
            />
            <Button>{text.searchClear}</Button>
          </InputGroup.Root>
        </Field.Root>
      </>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expectMinimumTargetSize(canvas.getByRole('textbox', { name: text.rentWithUnit }))
    await expectMinimumTargetSize(canvas.getByRole('button', { name: text.searchClear }))
  },
}

/** Right to left, in English: a `€` prefix is the start Addon, so it sits on the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => {
    const { text, lang } = textsFor('en')
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.amountEuro}</Field.Label>
        <InputGroup.Root>
          <InputGroup.Addon>{text.amountEuroUnit}</InputGroup.Addon>
          <InputGroup.Input
            name="amount"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-10 kv-input--numeric"
          />
        </InputGroup.Root>
      </Field.Root>
    )
  },
  play: async ({ canvas }) => {
    const { text } = textsFor('en')
    await expect(canvas.getByRole('textbox', { name: text.amountEuro })).toBeVisible()
  },
}

/** The edge, the invalid width, the unit and the Button's divider survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => {
    const { text, lang, amountExample } = textsFor(localeOf(globals))
    return (
      <>
        <Field.Root required invalid lang={lang}>
          <Field.Label>{text.rentWithUnit}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Input
              name="rent"
              inputMode="decimal"
              spellCheck={false}
              autoComplete="off"
              className="kv-input--width-10 kv-input--numeric"
            />
            <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
          </InputGroup.Root>
          <Field.HelpText>{text.rentUnitExample(amountExample)}</Field.HelpText>
          <Field.ErrorMessage>{text.rentError(amountExample)}</Field.ErrorMessage>
        </Field.Root>
        <Field.Root required lang={lang}>
          <Field.Label>{text.workTime}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Input
              name="work-time"
              inputMode="decimal"
              className="kv-input--width-4 kv-input--numeric"
            />
            <InputGroup.Addon>{text.workTimeUnit}</InputGroup.Addon>
          </InputGroup.Root>
          <Field.HelpText>{text.workTimeExample}</Field.HelpText>
        </Field.Root>
        <Field.Root required disabled lang={lang}>
          <Field.Label>{text.distance}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Input
              name="distance"
              inputMode="decimal"
              defaultValue={amountExample}
              className="kv-input--width-6 kv-input--numeric"
            />
            <InputGroup.Addon>{text.distanceUnit}</InputGroup.Addon>
          </InputGroup.Root>
        </Field.Root>
        <Field.Root lang={lang}>
          <Field.Label marker="none">{text.searchServices}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Addon>
              <Icon name="search" size={5} />
            </InputGroup.Addon>
            <InputGroup.Input
              type="search"
              name="search"
              enterKeyHint="search"
              autoComplete="off"
              defaultValue="parkering"
            />
            <Button>{text.searchClear}</Button>
          </InputGroup.Root>
        </Field.Root>
      </>
    )
  },
}
