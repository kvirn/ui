import { Autocomplete, Button, Card, Field } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/autocomplete/autocomplete.a11y.md?raw'
import guide from '../../../../../packages/react/src/autocomplete/autocomplete.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { virtualizedCount } from '../form/virtualized.fixture.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  AutocompleteStates,
  DefaultExample,
  KeyboardExample,
  StreetAutocomplete,
  VirtualizedExample,
  autocompleteTextsFor,
  longList,
  streets,
} from './autocomplete.fixture.tsx'

// Components/Form/Autocomplete: Autocomplete.Root, Control, Input, Toggle, Clear and the popup
// parts it shares with the Combobox and the Listbox (contract: autocomplete.a11y.md).
// The Docs page opens with the package docs: how to use it. autocomplete.e2e.ts runs the keyboard
// rows, forced colours, reduced motion and reflow checks against these stories.
//
// KvirnUI holds no form state. The value is the text: pass `value` and
// `onValueChange` (Controlled), or `defaultValue` and `name` for a plain form (PlainForm).
// Nothing here validates: an invalid story sets `invalid` itself.

const description = usageGuide(guide)

/**
 * The props the Controls and Docs pages describe. `Autocomplete.Root` is generic in its item,
 * which Storybook's args can't express, so the stories are typed with this plain shape and write
 * their own JSX.
 */
interface AutocompleteStoryArgs {
  items?: readonly unknown[]
  groups?: readonly unknown[]
  itemToString?: (item: never) => string
  isItemDisabled?: (item: never) => boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, details?: { reason?: string }) => void
  filter?: false | ((item: never, query: string) => boolean)
  isLoading?: boolean
  name?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details?: { reason?: string }) => void
  announcementDebounceMilliseconds?: number
  messages?: Record<string, unknown>
  virtualize?: boolean | { estimateSize?: number; overscan?: number }
}

const meta = {
  title: 'Components/Form/Autocomplete',
  argTypes: {
    items: {
      control: false,
      description: 'A flat list of suggestions. Ignored when `groups` is given.',
    },
    groups: {
      control: false,
      description: 'Suggestions in named groups: `{ key, label, items }`.',
    },
    itemToString: {
      control: false,
      description: 'The text of a suggestion: shown, filtered, and put in the input when picked.',
    },
    isItemDisabled: { control: false },
    value: { control: false, description: 'Controlled: the text in the input.' },
    defaultValue: { control: false, description: 'Uncontrolled: the text to begin with.' },
    onValueChange: {
      control: false,
      description: 'Called with the text and `{ reason }`: `input`, `selection` or `clear`.',
    },
    filter: {
      control: false,
      description: 'Your own filter, or `false` for suggestions that the server has chosen.',
    },
    isLoading: { control: false, description: 'The suggestions are being fetched.' },
    name: { control: false, description: 'Put on the input, so a plain form sends the text.' },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
    announcementDebounceMilliseconds: {
      control: false,
      description: 'How long after typing stops the count is announced. Default 500.',
    },
    messages: { control: false },
    virtualize: {
      control: false,
      description:
        'Renders only the suggestions in view, for a flat list of thousands. `true`, or `{ estimateSize, overscan }`. Not with `groups`.',
    },
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
  parameters: {
    a11yContract: contract,
    docs: {
      description: { component: description },
    },
  },
} satisfies Meta<AutocompleteStoryArgs>

export default meta
type Story = StoryObj<typeof meta>

type Canvas = ReturnType<typeof within>

/** The first of the elements a query found. A query that found none has already thrown. */
function firstOf(elements: HTMLElement[]): HTMLElement {
  const [first] = elements
  if (first === undefined) {
    throw new Error('No element found')
  }
  return first
}

/** The input of the Autocomplete: its name is the label. */
// A regular expression: the label of an optional field ends in "(valfritt)".
const inputOf = (canvas: Canvas, label: string) =>
  canvas.getByRole('combobox', { name: new RegExp(label) })

/** Opens the popup the way a keyboard user does, and waits for it. */
async function openWithKey(canvas: Canvas, input: HTMLElement) {
  await userEvent.click(input)
  await userEvent.keyboard('{ArrowDown}')
  await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
}

/**
 * An Autocomplete in a Field: a 44px box with the input, a button that opens the list and one
 * that clears the text. Type a few letters and pick a suggestion, or keep your own text.
 */
export const Default: Story = {
  parameters: showSource('autocomplete/autocomplete.fixture.tsx', 'DefaultExample'),
  render: (_args, { globals }) => <DefaultExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toHaveAttribute('aria-autocomplete', 'list')
    await expectMinimumTargetSize(input)
    await userEvent.type(input, 'kung')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    // No suggestion is highlighted until an arrow key, so Enter would not pick one.
    await expect(input).not.toHaveAttribute('aria-activedescendant')
    await userEvent.click(canvas.getByRole('option', { name: 'Kungsgatan' }))
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
    await expect(input).toHaveValue('Kungsgatan')
    await expect(input).toHaveFocus()
  },
}

/**
 * The fixture the keyboard tests drive: a button, an Autocomplete with a disabled suggestion, a
 * disabled Autocomplete, and a submit button in a form that shows what it sent. Try the keys in
 * the Keyboard section above: type to filter, ArrowDown and ArrowUp, Page Up and Page Down,
 * Enter, Escape, Tab, Alt+ArrowDown and Alt+ArrowUp.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <KeyboardExample locale={localeOf(globals)} />,
}

/** Just the input and the popup, with no box and no buttons: the smallest Autocomplete. */
export const Minimal: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete withButtons={false} placeholder={text.placeholder} />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await expectMinimumTargetSize(input)
  },
}

/** A value to begin with: the text shows, and the popup stays closed until the user types or opens it. */
export const WithValue: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete defaultValue="Kung" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await expect(input).toHaveValue('Kung')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

/** Typing filters the suggestions: å, ä and ö are not a and o in Swedish, so "ä" finds only the names that have it. */
export const Suggestions: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <Field.Prose>
          <p>{text.hint}</p>
        </Field.Prose>
        <StreetAutocomplete />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await userEvent.type(input, 'ä')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('option', { name: 'Järnvägsgatan' })).toBeVisible()
    await expect(canvas.queryByRole('option', { name: 'Storgatan' })).toBeNull()
  },
}

/** Nothing matches: the popup is open with no suggestions, and the typed text is a fine value. */
export const NoSuggestions: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={streets}>
          <Autocomplete.Input />
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
            <Autocomplete.Empty />
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
    )
  },
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await userEvent.type(input, 'Min egen gata')
    // Plain text beside a hidden listbox, not an option: no screen reader reads it as "option 1 of 1".
    await waitFor(() => expect(canvasElement.querySelector('.kv-listbox-empty')).toBeVisible())
    await expect(canvas.queryAllByRole('option')).toHaveLength(0)
    // No suggestion: the input says collapsed, and the typed text is a fine value.
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toHaveValue('Min egen gata')
  },
}

/** The suggestions are being fetched: the popup says "Laddar resultat", with `filter={false}` and `isLoading`. */
export const Loading: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={[]} filter={false} isLoading>
          <Autocomplete.Input />
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
            <Autocomplete.Empty />
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
    )
  },
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    await userEvent.type(inputOf(canvas, text.street), 'a')
    await waitFor(() =>
      expect(canvasElement.querySelector('.kv-listbox-popup')).toHaveAttribute('data-loading'),
    )
    await expect(canvasElement.querySelector('.kv-listbox-empty')).toBeVisible()
    await expect(canvas.queryAllByRole('option')).toHaveLength(0)
  },
}

/** A disabled suggestion is reachable with the arrow keys, read as unavailable, and can't be picked. */
export const DisabledSuggestion: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    await userEvent.type(inputOf(canvas, text.street), 'stora')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('option', { name: 'Stora Torget' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/** Invalid: a 2px edge and the message under the field. The text stays, whatever it is. */
export const Invalid: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <Field.Prose>
          <p>{text.hint}</p>
        </Field.Prose>
        <StreetAutocomplete />
        <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAttribute('aria-required', 'true')
    await expect(input).toHaveAccessibleDescription(new RegExp(`${text.hint}.*${text.error}`))
  },
}

/** Disabled: a dashed edge on the surface colour, no tab stop, and the popup never opens. */
export const Disabled: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root disabled lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete defaultValue="Storgatan" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    await expect(inputOf(canvas, text.street)).toBeDisabled()
  },
}

/** A long list scrolls inside the popup, which is never taller than the room that is left. */
export const LongList: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete items={longList} />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    await openWithKey(canvas, inputOf(canvas, text.street))
    await expect(canvas.getAllByRole('option')).toHaveLength(300)
  },
}

/**
 * 10 000 suggestions with `virtualize`: only the ones in view (and the active one) are in the
 * page, and every one says how big the list is and where it is in it (`aria-setsize`,
 * `aria-posinset`). Type `v`, then try ArrowUp and Page Down: the keys reach suggestions that were
 * never rendered, and `aria-activedescendant` always points at one that is.
 */
export const Virtualized: Story = {
  parameters: showSource('autocomplete/autocomplete.fixture.tsx', 'VirtualizedExample'),
  render: (_args, { globals }) => <VirtualizedExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await userEvent.type(input, 'v')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await waitFor(() => expect(canvas.getAllByRole('option').length).toBeGreaterThan(5))
    // Only a window is in the page, and the first suggestion knows where it is in the whole list.
    await expect(canvas.getAllByRole('option').length).toBeLessThan(80)
    const [first] = canvas.getAllByRole('option')
    await expect(first).toHaveAttribute('aria-posinset', '1')
    await expect(Number(first?.getAttribute('aria-setsize'))).toBeGreaterThan(1000)
    await expect(Number(first?.getAttribute('aria-setsize'))).toBeLessThanOrEqual(virtualizedCount)
  },
}

/**
 * The Virtualized fixture with no play function, for the keyboard tests to drive from an empty
 * input. Try typing, ArrowUp, ArrowDown and Page Down in the Keyboard section above.
 */
export const VirtualizedKeyboard: Story = {
  parameters: showSource('autocomplete/autocomplete.fixture.tsx', 'VirtualizedExample'),
  render: (_args, { globals }) => <VirtualizedExample locale={localeOf(globals)} />,
}

/** Groups: `role="group"` named by its label. */
export const Groups: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    const groups = [
      { key: 'streets', label: 'Gator', items: ['Storgatan', 'Kungsgatan'] },
      { key: 'roads', label: 'Vägar', items: ['Björkvägen', 'Tallvägen'] },
    ]
    return (
      <Field.Root lang={lang}>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root groups={groups}>
          <Autocomplete.Input />
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    await openWithKey(canvas, inputOf(canvas, text.street))
    await expect(canvas.getByRole('group', { name: 'Gator' })).toBeVisible()
    await expect(canvas.getAllByRole('group')).toHaveLength(2)
  },
}

/** A long label in a 320px column, and a long chosen suggestion: both wrap, and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    const items = [
      'Pohjois-Pohjanmaan sairaanhoitopiirin kuntayhtymän vanhustenhuollon palvelukeskus',
      ...streets.slice(0, 3),
    ]
    return (
      <div
        className="kv-story-narrow"
        data-testid="narrow"
        style={{ paddingInline: 'var(--kv-space-4)' }}
      >
        <Field.Root lang={lang}>
          <Field.Label>{text.longLabel}</Field.Label>
          <StreetAutocomplete items={items} defaultValue="Pohjois" />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await userEvent.click(firstOf(canvas.getAllByRole('combobox')))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11), and the popup its own edge. */
export const OnSurfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <Card.Root lang={lang}>
        <Field.Root required invalid>
          <Field.Label>{text.street}</Field.Label>
          <StreetAutocomplete />
          <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
        </Field.Root>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    await expect(inputOf(canvas, text.street)).toBeVisible()
  },
}

/** Staff density from 64rem: 32px high box and options, with the text still 16px. */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = autocompleteTextsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root>
          <Field.Label>{text.street}</Field.Label>
          <StreetAutocomplete />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = autocompleteTextsFor(localeOf(globals))
    await expectMinimumTargetSize(inputOf(canvas, text.street))
  },
}

/** Controlled by your form state: this story's `useState` stands in for TanStack Form or React Hook Form. */
function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = autocompleteTextsFor(locale)
  const [value, setValue] = useState('Kung')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete value={value} onValueChange={setValue} />
      </Field.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {shared.youChose}: {value === '' ? '–' : value}
      </p>
    </div>
  )
}

/**
 * Controlled: the Autocomplete shows the `value` it is given and calls `onValueChange(text, { reason })`
 * when the user types, picks a suggestion or clears. It never copies the text into state, so a parent
 * that refuses a change leaves it as it was.
 */
export const Controlled: Story = {
  render: (_args, { globals }) => <ControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, shared } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await expect(input).toHaveValue('Kung')
    await userEvent.type(input, 's')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${shared.youChose}: Kungs`)
    await userEvent.click(await canvas.findByRole('option', { name: 'Kungsgatan' }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${shared.youChose}: Kungsgatan`)
  },
}

/** An uncontrolled form: the input carries the `name`, and the submit reads the text by it. Free text is sent as it is. */
function PlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = autocompleteTextsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('street')
        setSent(typeof value === 'string' ? value : '')
      }}
    >
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete name="street" defaultValue="Storgatan" />
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {shared.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {shared.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/** A plain `<form>`: no `value` and no handlers. The form's `FormData` has the text by `name` on submit. */
export const PlainForm: Story = {
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, shared } = autocompleteTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.street)
    await userEvent.clear(input)
    await userEvent.type(input, 'Min egen gata 4')
    await userEvent.keyboard('{Escape}')
    await userEvent.click(canvas.getByRole('button', { name: shared.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${shared.sent}: Min egen gata 4`)
  },
}

/** Right to left, in English: the chevron is at the left, and the text starts at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <AutocompleteStates locale="en" />,
  play: async ({ canvas }) => {
    await userEvent.click(firstOf(canvas.getAllByRole('combobox')))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
  },
}

/** The edges, the invalid width, the cross, the chevron and the active suggestion stay visible in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <AutocompleteStates locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(firstOf(canvas.getAllByRole('combobox')))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
  },
}
