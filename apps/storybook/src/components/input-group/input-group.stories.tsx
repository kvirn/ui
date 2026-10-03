import {
  Button,
  Card,
  ErrorMessage,
  Field,
  Icon,
  Input,
  InputGroup,
  Label,
  Prose,
} from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/input-group/input-group.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect, userEvent } from 'storybook/test'
import { localeOf, textsFor, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/InputGroup: an Input with a unit, a symbol, a decorative icon or a button
// inside its box (ADR-0031, design spec docs/design/form-fields.md §6.13). InputGroup.Root is
// the box: it draws the edge, the invalid and disabled state and the focus ring. InputGroup.Addon
// is a short unit or a decorative icon: `aria-hidden`, never focusable, so the label always
// carries the meaning ("Månadshyra i kronor", never "Månadshyra" plus a "kr" Addon). A real
// Button (clear, show password) goes directly in the Root, never in an Addon: it keeps its own
// name and Tab stop.
//
// KvirnUI holds no form state (ADR-0029, item 0). The clear Button of SearchWithClear keeps the
// value in this story's `useState`, where your form library's state would live. Nothing here
// validates: an invalid story sets `invalid` itself. input-group.e2e.ts runs the focus ring,
// Tab order, RTL, forced-colours and reflow checks.

const meta = {
  title: 'Components/Form/InputGroup',
  component: InputGroup.Root,
  argTypes: {
    invalid: {
      control: 'boolean',
      description: 'Default: the nearest Field’s `invalid`. `data-invalid` on the box.',
    },
    disabled: {
      control: 'boolean',
      description: 'Default: the nearest Field’s `disabled`. `data-disabled` on the box.',
    },
    render: { control: false },
  },
  parameters: { a11yContract: contract },
  globals: { locale: 'sv' },
  decorators: [
    (Story) => (
      <div className="kv-story-form">
        <Story />
      </div>
    ),
    withFormLocale,
  ],
  render: (args, { globals }) => <RentField locale={localeOf(globals)} {...args} />,
} satisfies Meta<typeof InputGroup.Root>

export default meta
type Story = StoryObj<typeof meta>

interface RentFieldProps {
  locale: FormLocale
  invalid?: boolean | undefined
  disabled?: boolean | undefined
  readOnly?: boolean
  /** The error under the hint under the control, when invalid. */
  withError?: boolean
}

/** Rent with "kr": the example under the box, and the error under the example. */
function RentField({ locale, invalid, disabled, readOnly, withError }: RentFieldProps) {
  const { text, lang, amountExample } = textsFor(locale)
  return (
    <Field required invalid={invalid} disabled={disabled} lang={lang}>
      <Label>{text.rentWithUnit}</Label>
      <InputGroup.Root>
        <Input
          name="rent"
          inputMode="decimal"
          spellCheck={false}
          autoComplete="off"
          readOnly={readOnly}
          defaultValue={invalid || readOnly || disabled ? '8450' : undefined}
          className="kv-input--width-10 kv-input--numeric"
        />
        <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
      </InputGroup.Root>
      <Prose>
        <p>{text.rentUnitExample(amountExample)}</p>
      </Prose>
      {withError ? <ErrorMessage>{text.rentError(amountExample)}</ErrorMessage> : null}
    </Field>
  )
}

interface SearchExampleProps {
  locale: FormLocale
  /** The value the search starts with. */
  initialValue?: string
  /** An icon-only clear Button, named from the translations: staff and compact only. */
  iconOnly?: boolean
  disabled?: boolean
}

/**
 * A search with a start icon and a clear Button at the end. The Button renders only while there
 * is a value, and clearing moves focus to the Input, so focus never lands on the body when the
 * Button goes away. Nothing is announced: the focused, empty Input is read as such.
 */
function SearchExample({
  locale,
  initialValue = '',
  iconOnly = false,
  disabled,
}: SearchExampleProps) {
  const { text, lang } = textsFor(locale)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <Field disabled={disabled} lang={lang}>
      <Label marker="none">{text.searchServices}</Label>
      <InputGroup.Root>
        <InputGroup.Addon>
          <Icon name="search" size="md" />
        </InputGroup.Addon>
        <Input
          ref={inputRef}
          type="search"
          name="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          onValueChange={setValue}
        />
        {value === '' ? null : (
          <Button
            disabled={disabled}
            className={iconOnly ? 'kv-button--icon-only' : undefined}
            aria-label={iconOnly ? text.searchClearName : undefined}
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
            }}
          >
            {iconOnly ? <Icon name="close" size="md" /> : text.searchClear}
          </Button>
        )}
      </InputGroup.Root>
    </Field>
  )
}

/**
 * A unit at the end: the "kr" is `aria-hidden`, so the label says it, and the example under the
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
  render: (_args, { globals }) => (
    <SearchExample locale={localeOf(globals)} initialValue="parkering" />
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
      <Field required lang={lang}>
        <Label>{text.workTime}</Label>
        <InputGroup.Root>
          <Input
            name="work-time"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-4 kv-input--numeric"
          />
          <InputGroup.Addon>{text.workTimeUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Prose>
          <p>{text.workTimeExample}</p>
        </Prose>
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    const input = canvas.getByRole('textbox', { name: text.workTime })
    await userEvent.type(input, '37,5')
    await expect(input).toHaveValue('37,5')
  },
}

/** A distance: "km" at the end, and the hint above the box, because it's read before typing. */
export const Distance: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.distance}</Label>
        <Prose>
          <p>{text.distanceHint}</p>
        </Prose>
        <InputGroup.Root>
          <Input
            name="distance"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-6 kv-input--numeric"
          />
          <InputGroup.Addon>{text.distanceUnit}</InputGroup.Addon>
        </InputGroup.Root>
      </Field>
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
      <Field lang={lang}>
        <Label marker="none">{text.searchServices}</Label>
        <InputGroup.Root>
          <InputGroup.Addon>
            <Icon name="search" size="md" />
          </InputGroup.Addon>
          <Input type="search" name="search" enterKeyHint="search" autoComplete="off" />
        </InputGroup.Root>
      </Field>
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
  render: (_args, { globals }) => <SearchExample locale={localeOf(globals)} />,
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
  render: (_args, { globals }) => (
    <div className="kv-compact">
      <SearchExample locale={localeOf(globals)} initialValue="parkering" iconOnly />
    </div>
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
      <Field required lang={lang}>
        <Label>{text.visitDate}</Label>
        <InputGroup.Root>
          <Input
            name="visit-date"
            autoComplete="off"
            spellCheck={false}
            className="kv-input--width-10 kv-input--numeric"
          />
          <InputGroup.Addon>
            <Icon name="calendar" size="md" />
          </InputGroup.Addon>
        </InputGroup.Root>
        <Prose>
          <p>{text.visitDateExample}</p>
        </Prose>
      </Field>
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
  render: (_args, { globals }) => <RentField locale={localeOf(globals)} invalid withError />,
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

/** Disabled: a dashed edge on the surface colour, the unit and the value muted. */
export const Disabled: Story = {
  render: (_args, { globals }) => (
    <div className="kv-story-form">
      <RentField locale={localeOf(globals)} disabled />
      <SearchExample locale={localeOf(globals)} initialValue="parkering" disabled />
    </div>
  ),
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.rentWithUnit })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: text.searchClear })).toBeDisabled()
  },
}

/** Read-only, in staff tools: a solid edge on the surface colour, and still focusable. */
export const ReadOnly: Story = {
  render: (_args, { globals }) => <RentField locale={localeOf(globals)} readOnly />,
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
  render: (_args, { globals }) => (
    <Card.Root>
      <RentField locale={localeOf(globals)} invalid withError />
    </Card.Root>
  ),
  play: async ({ canvas, globals }) => {
    const { text } = textsFor(localeOf(globals))
    await expect(canvas.getByRole('textbox', { name: text.rentWithUnit })).toBeVisible()
  },
}

/** A long Finnish label that carries the unit wraps and hyphenates in a 320px column. */
export const LongFinnishLabel: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field required lang={lang}>
          <Label>{text.grantWithUnit}</Label>
          <InputGroup.Root>
            <Input
              name="grant"
              inputMode="decimal"
              spellCheck={false}
              autoComplete="off"
              className="kv-input--width-20 kv-input--numeric"
            />
            <InputGroup.Addon>{text.rentUnit}</InputGroup.Addon>
          </InputGroup.Root>
        </Field>
      </div>
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
  render: (_args, { globals }) => (
    <div className="kv-compact kv-story-form">
      <RentField locale={localeOf(globals)} />
      <SearchExample locale={localeOf(globals)} initialValue="parkering" />
    </div>
  ),
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
      <Field required lang={lang}>
        <Label>{text.amountEuro}</Label>
        <InputGroup.Root>
          <InputGroup.Addon>{text.amountEuroUnit}</InputGroup.Addon>
          <Input
            name="amount"
            inputMode="decimal"
            spellCheck={false}
            autoComplete="off"
            className="kv-input--width-10 kv-input--numeric"
          />
        </InputGroup.Root>
      </Field>
    )
  },
  play: async ({ canvas }) => {
    const { text } = textsFor('en')
    await expect(canvas.getByRole('textbox', { name: text.amountEuro })).toBeVisible()
  },
}

/** Every state of the box in one column, with names that stay unique on the page. */
function GroupStates({ locale }: { locale: FormLocale }) {
  const { text, lang, amountExample } = textsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <RentField locale={locale} invalid withError />
      <Field required>
        <Label>{text.workTime}</Label>
        <InputGroup.Root>
          <Input
            name="work-time"
            inputMode="decimal"
            className="kv-input--width-4 kv-input--numeric"
          />
          <InputGroup.Addon>{text.workTimeUnit}</InputGroup.Addon>
        </InputGroup.Root>
        <Prose>
          <p>{text.workTimeExample}</p>
        </Prose>
      </Field>
      <Field required disabled>
        <Label>{text.distance}</Label>
        <InputGroup.Root>
          <Input
            name="distance"
            inputMode="decimal"
            defaultValue={amountExample}
            className="kv-input--width-6 kv-input--numeric"
          />
          <InputGroup.Addon>{text.distanceUnit}</InputGroup.Addon>
        </InputGroup.Root>
      </Field>
      <SearchExample locale={locale} initialValue="parkering" />
    </div>
  )
}

/** The edge, the invalid width, the unit and the Button's divider survive forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <GroupStates locale={localeOf(globals)} />,
}
