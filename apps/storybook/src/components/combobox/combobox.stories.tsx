import { Button, Card, Combobox, Field } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/combobox/combobox.a11y.md?raw'
import guide from '../../../../../packages/react/src/combobox/combobox.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ComboboxStates,
  DefaultExample,
  KeyboardExample,
  MultipleExample,
  MunicipalitiesCombobox,
  MunicipalityCombobox,
  comboboxTextsFor,
  longList,
  municipalities,
  municipalitiesWithClosed,
  richMunicipalities,
} from './combobox.fixture.tsx'
import type { Municipality } from './combobox.fixture.tsx'

// Components/Form/Combobox: Combobox.Root, Control, Input, Toggle, Clear, ValueList, Value and the
// popup parts it shares with the Listbox (ADR-0037; contract: combobox.a11y.md). The Docs page
// opens with the package docs: how to use it. combobox.e2e.ts runs the keyboard rows, forced
// colours, reduced motion and reflow checks against these stories.
//
// KvirnUI holds no form state (ADR-0029, item 0). The value is the chosen option's key: pass
// `value` and `onValueChange` (Controlled), or `defaultValue` and `name` for a plain form
// (PlainForm). Nothing here validates: an invalid story sets `invalid` itself.

const description = usageGuide(guide)

/**
 * The props the Controls and Docs pages describe. `Combobox.Root` is generic in its item and has
 * two option types (single and multiple), which Storybook's args can't express, so the stories
 * are typed with this plain shape and write their own JSX.
 */
interface ComboboxStoryArgs {
  items?: readonly unknown[]
  groups?: readonly unknown[]
  itemToString?: (item: never) => string
  itemToKey?: (item: never) => string
  isItemDisabled?: (item: never) => boolean
  multiple?: boolean
  value?: string | null | readonly string[]
  defaultValue?: string | null | readonly string[]
  onValueChange?: (value: unknown, details?: { reason?: string }) => void
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (value: string, details?: { reason?: string }) => void
  filter?: false | ((item: never, query: string) => boolean)
  isLoading?: boolean
  name?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details?: { reason?: string }) => void
  announcementDebounceMilliseconds?: number
  messages?: Record<string, unknown>
}

const meta = {
  title: 'Components/Form/Combobox',
  argTypes: {
    items: { control: false, description: 'A flat list of items. Ignored when `groups` is given.' },
    groups: { control: false, description: 'Items in named groups: `{ key, label, items }`.' },
    itemToString: {
      control: false,
      description: 'The text of an item: shown, filtered, and put in the input when chosen.',
    },
    itemToKey: { control: false, description: 'A stable, unique key: what the value holds.' },
    isItemDisabled: { control: false },
    multiple: { control: false, description: 'Several choices. The value is an array of keys.' },
    value: { control: false, description: 'Controlled: the chosen key, or `null`.' },
    defaultValue: { control: false, description: 'Uncontrolled: the key chosen to begin with.' },
    onValueChange: {
      control: false,
      description: 'Called with the key (or keys) and `{ reason }`.',
    },
    inputValue: { control: false, description: 'Controlled: the text in the input.' },
    defaultInputValue: { control: false },
    onInputValueChange: { control: false, description: 'Called with the text and `{ reason }`.' },
    filter: {
      control: false,
      description: 'Your own filter, or `false` for results that the server has filtered.',
    },
    isLoading: { control: false, description: 'The options are being fetched.' },
    name: { control: false, description: 'A hidden input per chosen key, for a plain form.' },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
    announcementDebounceMilliseconds: {
      control: false,
      description: 'How long after typing stops the result count is announced. Default 500.',
    },
    messages: { control: false },
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
} satisfies Meta<ComboboxStoryArgs>

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

/** The input of the single-choice Combobox: its name is the label. */
const inputOf = (canvas: Canvas, label: string) => canvas.getByRole('combobox', { name: label })

/** Opens the popup the way a keyboard user does, and waits for it. */
async function openWithKey(canvas: Canvas, input: HTMLElement) {
  await userEvent.click(input)
  await userEvent.keyboard('{ArrowDown}')
  await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
}

/**
 * A Combobox in a Field: a 44px box with the input, a button that opens the list and one that
 * clears the text. Type a few letters (try ö) and choose from the list.
 */
export const Default: Story = {
  parameters: showSource('combobox/combobox.fixture.tsx', 'DefaultExample'),
  render: (_args, { globals }) => <DefaultExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toHaveAttribute('aria-autocomplete', 'list')
    const box = input.closest('.kv-combobox-control')
    await expect(box?.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
    await expectMinimumTargetSize(input)
    await userEvent.type(input, 'ö')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    // No option is highlighted until an arrow key, so Enter would not choose one.
    await expect(input).not.toHaveAttribute('aria-activedescendant')
    await userEvent.click(canvas.getByRole('option', { name: 'Göteborg' }))
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
    await expect(input).toHaveValue('Göteborg')
    await expect(input).toHaveFocus()
  },
}

/**
 * The fixture the keyboard tests drive: a button, a Combobox with a disabled option, a disabled
 * Combobox, a Combobox of several choices with two values chosen, and a submit button in a
 * form. Try the keys in the Keyboard section above: type to filter, ArrowDown and ArrowUp, Page
 * Up and Page Down, Enter, Escape, Tab, Alt+ArrowDown and Alt+ArrowUp, and Backspace, Enter and
 * Space on the remove buttons.
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <KeyboardExample locale={localeOf(globals)} />,
}

/** Just the input and the popup, with no box and no buttons: the smallest Combobox. */
export const Minimal: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox withButtons={false} />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await expect(input.closest('.kv-combobox-control')).toBeNull()
    await expectMinimumTargetSize(input)
  },
}

/** A chosen option shows its text in the input, and the whole list is there when it opens again. */
export const Selected: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox defaultValue="malmö" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await expect(input).toHaveValue('Malmö')
    await openWithKey(canvas, input)
    await expect(canvas.getAllByRole('option')).toHaveLength(municipalities.length)
    await expect(canvas.getByRole('option', { name: 'Malmö' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  },
}

/** Typing filters the list: å, ä and ö are not a and o in Swedish, so "ä" finds only the names that have it. */
export const Filtering: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Description>{text.hint}</Field.Description>
        <MunicipalityCombobox />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await userEvent.type(input, 'ä')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('option', { name: 'Gävle' })).toBeVisible()
    await expect(canvas.queryByRole('option', { name: 'Ale' })).toBeNull()
  },
}

/** Nothing matches: the popup says so (and the screen reader is told), and the typed text stays. */
export const NoResults: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox />
      </Field.Root>
    )
  },
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await userEvent.type(input, 'zzz')
    // Plain text beside a hidden listbox, not an option: no screen reader reads it as "option 1 of 1".
    await waitFor(() => expect(canvasElement.querySelector('.kv-listbox-empty')).toBeVisible())
    await expect(canvas.queryAllByRole('option')).toHaveLength(0)
    // Nothing to move into: the input says collapsed, and the typed text stays.
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toHaveValue('zzz')
  },
}

/** The options are being fetched: the popup says "Laddar resultat", with `filter={false}` and `isLoading`. */
export const Loading: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox items={[]} filter={false} isLoading />
      </Field.Root>
    )
  },
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await userEvent.type(input, 'a')
    await waitFor(() =>
      expect(canvasElement.querySelector('.kv-listbox-popup')).toHaveAttribute('data-loading'),
    )
    await expect(canvasElement.querySelector('.kv-listbox-empty')).toBeVisible()
    await expect(canvas.queryAllByRole('option')).toHaveLength(0)
  },
}

function GroupsCombobox({ locale }: { locale: FormLocale }) {
  const { text } = comboboxTextsFor(locale)
  const pick = (...picked: string[]) =>
    municipalities.filter((municipality) => picked.includes(municipality.name))
  const groups = [
    { key: 'west', label: text.groupWest, items: pick('Göteborg', 'Borås') },
    { key: 'east', label: text.groupEast, items: pick('Stockholm', 'Uppsala') },
    { key: 'south', label: text.groupSouth, items: pick('Malmö') },
  ]
  return (
    <Combobox.Root
      groups={groups}
      itemToString={(municipality: Municipality) => municipality.name}
      itemToKey={(municipality: Municipality) => municipality.code}
    >
      <Combobox.Control>
        <Combobox.Input />
        <Combobox.Clear />
        <Combobox.Toggle />
      </Combobox.Control>
      <Combobox.Popup>
        <Combobox.List>
          {(municipality: Municipality) => <Combobox.Option item={municipality} />}
        </Combobox.List>
        <Combobox.Empty />
      </Combobox.Popup>
    </Combobox.Root>
  )
}

/** Groups: `role="group"` named by its label. A group left with no match is not shown while filtering. */
export const Groups: Story = {
  render: (_args, { globals }) => {
    const locale = localeOf(globals)
    const { text, lang } = comboboxTextsFor(locale)
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <GroupsCombobox locale={locale} />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const locale = localeOf(globals)
    const { text } = comboboxTextsFor(locale)
    await openWithKey(canvas, inputOf(canvas, text.municipality))
    await expect(canvas.getByRole('group', { name: text.groupWest })).toBeVisible()
    await expect(canvas.getAllByRole('group')).toHaveLength(3)
  },
}

/** A disabled option is reachable with the arrow keys, read as unavailable, and can't be chosen. */
export const DisabledOption: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox items={municipalitiesWithClosed} />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    await userEvent.type(inputOf(canvas, text.municipality), 'stock')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('option', { name: 'Stockholm' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/** Invalid: a 2px edge and the message under the field. The text that matched nothing stays. */
export const Invalid: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required invalid lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Description>{text.hint}</Field.Description>
        <MunicipalityCombobox defaultInputValue="Gö" />
        <Field.ErrorMessage>{text.notInList}</Field.ErrorMessage>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAttribute('aria-required', 'true')
    await expect(input).toHaveValue('Gö')
    await expect(input).toHaveAccessibleDescription(new RegExp(`${text.hint}.*${text.notInList}`))
  },
}

/** Disabled: a dashed edge on the surface colour, no tab stop, and the popup never opens. */
export const Disabled: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required disabled lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox defaultValue="malmö" />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    await expect(inputOf(canvas, text.municipality)).toBeDisabled()
  },
}

/** Several choices, none chosen yet: the first choice appears as a chip before the input. */
export const Multiple: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.several}</Field.Label>
        <Field.Description>{text.severalHint}</Field.Description>
        <MunicipalitiesCombobox />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.several)
    await userEvent.type(input, 'ö')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
    await userEvent.click(canvas.getByRole('option', { name: 'Malmö' }))
    // The choice moved out of the field and into the list; the popup stays open for the next.
    await expect(input).toHaveValue('')
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1)
    await expect(canvas.getByRole('listbox')).toBeVisible()
  },
}

/** Several choices with one chosen: a chip with its remove button. Removing it moves focus to the input. */
export const MultipleOne: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.several}</Field.Label>
        <MunicipalitiesCombobox defaultValue={['malmö']} />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    const remove = canvas.getByRole('button', { name: /Malmö/ })
    await expectMinimumTargetSize(remove)
    await userEvent.click(remove)
    await expect(inputOf(canvas, text.several)).toHaveFocus()
    await expect(canvas.queryAllByRole('listitem')).toHaveLength(0)
  },
}

/** Several choices with many chosen: the chips wrap, and every one has its own remove button. */
export const MultipleMany: Story = {
  render: (_args, { globals }) => <MultipleExample locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
    await userEvent.click(canvas.getByRole('button', { name: /Malmö/ }))
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1)
  },
}

/** A long list scrolls inside the popup, which is never taller than the room that is left. */
export const LongList: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox items={longList} />
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    await openWithKey(canvas, inputOf(canvas, text.municipality))
    await expect(canvas.getAllByRole('option')).toHaveLength(300)
  },
}

/** A rich option: your own children replace the text. The name a screen reader reads is its text content. */
export const RichOptions: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Field.Root required lang={lang}>
        <Field.Label>{text.municipality}</Field.Label>
        <Combobox.Root
          items={richMunicipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
        >
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => (
                <Combobox.Option item={municipality}>
                  <span style={{ display: 'grid' }}>
                    <span>{municipality.name}</span>
                    <small style={{ color: 'var(--kv-color-text-muted)' }}>
                      {municipality.county}
                    </small>
                  </span>
                </Combobox.Option>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    await openWithKey(canvas, inputOf(canvas, text.municipality))
    await expect(canvas.getByRole('option', { name: /Göteborg/ })).toBeVisible()
  },
}

/** A long label in a 320px column, and a long chosen option: both wrap, and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, shared, lang } = comboboxTextsFor(localeOf(globals))
    const items: readonly Municipality[] = [
      { code: 'long', name: 'Pohjois-Pohjanmaan sairaanhoitopiirin kuntayhtymä' },
      ...municipalities.slice(0, 3),
    ]
    return (
      <div
        className="kv-story-narrow"
        data-testid="narrow"
        style={{ paddingInline: 'var(--kv-space-4)' }}
      >
        <Field.Root required lang={lang}>
          <Field.Label>{text.longLabel}</Field.Label>
          <MunicipalityCombobox items={items} defaultValue="long" />
        </Field.Root>
        <Field.Root required lang={lang}>
          <Field.Label>{shared.longSelectLabel}</Field.Label>
          <MunicipalitiesCombobox items={items} defaultValue={['long', 'ale']} />
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
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <Card.Root lang={lang}>
        <Field.Root required invalid>
          <Field.Label>{text.municipality}</Field.Label>
          <MunicipalityCombobox />
          <Field.ErrorMessage>{text.notInList}</Field.ErrorMessage>
        </Field.Root>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    await expect(inputOf(canvas, text.municipality)).toBeVisible()
  },
}

/** Staff density from 64rem: 32px high box and options, with the text still 16px. */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = comboboxTextsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field.Root required>
          <Field.Label>{text.municipality}</Field.Label>
          <MunicipalityCombobox />
        </Field.Root>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = comboboxTextsFor(localeOf(globals))
    await expectMinimumTargetSize(inputOf(canvas, text.municipality))
  },
}

/** Controlled by your form state: this story's `useState` stands in for TanStack Form or React Hook Form. */
function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = comboboxTextsFor(locale)
  const [value, setValue] = useState<string | null>('göteborg')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox value={value} onValueChange={setValue} />
      </Field.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {shared.youChose}: {value ?? '–'}
      </p>
    </div>
  )
}

/**
 * Controlled: the Combobox shows the `value` it is given and calls `onValueChange(value, { reason })`
 * with the chosen key, or `null` when the text no longer names the chosen option. It never copies
 * the value into state, so a parent that refuses a change leaves it as it was.
 */
export const Controlled: Story = {
  render: (_args, { globals }) => <ControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, shared } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await expect(input).toHaveValue('Göteborg')
    await userEvent.clear(input)
    await userEvent.type(input, 'upp')
    await userEvent.click(await canvas.findByRole('option', { name: 'Uppsala' }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${shared.youChose}: uppsala`)
    await expect(input).toHaveValue('Uppsala')
  },
}

/** An uncontrolled form: the hidden input carries the key, and the submit reads it by `name`. The typed text is never sent. */
function PlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = comboboxTextsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('municipality')
        setSent(typeof value === 'string' ? value : '')
      }}
    >
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox name="municipality" defaultValue="göteborg" />
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

/** A plain `<form>`: no `value` and no handlers. The form's `FormData` has the key by `name` on submit. */
export const PlainForm: Story = {
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text, shared } = comboboxTextsFor(localeOf(globals))
    const input = inputOf(canvas, text.municipality)
    await userEvent.clear(input)
    await userEvent.type(input, 'mal')
    await userEvent.click(await canvas.findByRole('option', { name: 'Malmö' }))
    await userEvent.click(canvas.getByRole('button', { name: shared.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${shared.sent}: malmö`)
  },
}

/** Right to left, in English: the chevron is at the left, and the chips start at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <ComboboxStates locale="en" />,
  play: async ({ canvas }) => {
    await userEvent.click(firstOf(canvas.getAllByRole('combobox')))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
  },
}

/** The edges, the invalid width, the cross, the chevron and the active option stay visible in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <ComboboxStates locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(firstOf(canvas.getAllByRole('combobox')))
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
  },
}
