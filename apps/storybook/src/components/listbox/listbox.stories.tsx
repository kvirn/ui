import { Button, Card, ErrorMessage, Field, Label, Listbox, Prose } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/listbox/listbox.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { choiceTextsFor, logChange } from '../form/choice.fixture.tsx'
import type { ChoiceTexts } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { virtualizedCount, virtualizedPlaces } from '../form/virtualized.fixture.ts'
import type { VirtualizedPlace } from '../form/virtualized.fixture.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Form/Listbox: the stylable popup (Listbox.Root, Trigger, Value, Popup, List, Option,
// Group, Empty), the APG select-only combobox (ADR-0037; contract: listbox.a11y.md). Listbox.Root
// renders the browser's own <select> instead on touch devices (native="auto") and for
// native="always". The popup stories use native="never" so they show the popup on any device, and
// the stories named Native… show the native rendering with native="always".
//
// KvirnUI holds no form state (ADR-0029, item 0). The value is the chosen option's key: pass
// `value` and `onValueChange` (Controlled), or `defaultValue` and `name` for a plain form
// (PlainForm). Nothing here validates: an invalid story sets `invalid` itself. listbox.e2e.ts runs
// the keyboard rows, forced colours, reduced motion and reflow checks against these stories.

const description = `A choice of one option (or several) from a list, with no typing of text. On a desktop it is a stylable popup: groups, rich options, and a look that is yours. On a phone, a single choice is the browser's own \`<select>\` (\`native="auto"\`).

**DOM focus stays on the trigger** and the active option is \`aria-activedescendant\`. No option is active until an arrow key or a letter, so Enter never chooses something you didn't move to. The value is the chosen option's key (\`itemToKey\`). Render \`Listbox.Popup\` right after \`Listbox.Trigger\`, inside a \`Field\`, and annotate the item in the \`Listbox.List\` function (\`(item: Municipality) => …\`) to type it.`

/**
 * The props the Controls and Docs pages describe. `Listbox.Root` is generic in its item and has
 * two option types (single and multiple), which Storybook's args can't express, so the stories
 * are typed with this plain shape and write their own JSX.
 */
interface ListboxStoryArgs {
  items?: readonly unknown[]
  groups?: readonly unknown[]
  itemToString?: (item: never) => string
  itemToKey?: (item: never) => string
  isItemDisabled?: (item: never) => boolean
  multiple?: boolean
  value?: string | null | readonly string[]
  defaultValue?: string | null | readonly string[]
  onValueChange?: (value: unknown, details?: { reason?: string }) => void
  native?: 'auto' | 'always' | 'never'
  name?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details?: { reason?: string }) => void
  messages?: Record<string, unknown>
  virtualize?: boolean | { estimateSize?: number; overscan?: number }
}

const meta = {
  title: 'Components/Form/Listbox',
  argTypes: {
    items: { control: false, description: 'A flat list of items. Ignored when `groups` is given.' },
    groups: { control: false, description: 'Items in named groups: `{ key, label, items }`.' },
    itemToString: { control: false, description: 'The text of an item. Default `String(item)`.' },
    itemToKey: { control: false, description: 'A stable, unique key: what the value holds.' },
    isItemDisabled: { control: false },
    multiple: { control: false, description: 'Several choices. The value is an array of keys.' },
    value: { control: false, description: 'Controlled: the chosen key, or `null`.' },
    defaultValue: { control: false, description: 'Uncontrolled: the key chosen to begin with.' },
    onValueChange: {
      control: false,
      description: 'Called with the key (or keys) and `{ reason }`.',
    },
    native: {
      control: false,
      description: '`auto` (default): a native select on touch devices, for one choice.',
    },
    name: { control: false, description: 'A hidden input per chosen key, for a plain form.' },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
    messages: { control: false },
    virtualize: {
      control: false,
      description:
        'Renders only the options in view, for a flat list of thousands. `true`, or `{ estimateSize, overscan }`. Not with `groups`.',
    },
  },
  args: { onValueChange: logChange('onValueChange') },
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
} satisfies Meta<ListboxStoryArgs>

export default meta
type Story = StoryObj<typeof meta>

interface Municipality {
  code: string
  name: string
  /** Shown under the name in a rich option. */
  county?: string
  disabled?: boolean
}

/** In the Swedish alphabet: å, ä and ö come last, and typeahead keeps them apart from a and o. */
const names = [
  'Ale',
  'Alingsås',
  'Arvika',
  'Borås',
  'Eskilstuna',
  'Falun',
  'Gävle',
  'Göteborg',
  'Halmstad',
  'Helsingborg',
  'Jönköping',
  'Kalmar',
  'Karlstad',
  'Kiruna',
  'Linköping',
  'Luleå',
  'Lund',
  'Malmö',
  'Norrköping',
  'Oskarshamn',
  'Skellefteå',
  'Stockholm',
  'Sundsvall',
  'Trollhättan',
  'Umeå',
  'Uppsala',
  'Varberg',
  'Västerås',
  'Växjö',
  'Åre',
  'Ängelholm',
  'Örebro',
  'Östersund',
]

const municipalities: readonly Municipality[] = names.map((name) => ({
  code: name.toLowerCase(),
  name,
}))

/** The same list with one option that can't be chosen now: it stays reachable with the arrows. */
const municipalitiesWithClosed: readonly Municipality[] = municipalities.map((municipality) =>
  municipality.name === 'Stockholm' ? { ...municipality, disabled: true } : municipality,
)

const counties: Record<string, string> = {
  Göteborg: 'Västra Götaland',
  Malmö: 'Skåne',
  Stockholm: 'Stockholm',
  Uppsala: 'Uppsala',
}

const richMunicipalities: readonly Municipality[] = Object.entries(counties).map(
  ([name, county]) => ({ code: name.toLowerCase(), name, county }),
)

const longList: readonly Municipality[] = Array.from({ length: 300 }, (_, index) => ({
  code: `ort-${index + 1}`,
  name: `Ort ${index + 1}`,
}))

/** What the stories add to the shared fixture: the label of the list of several. */
const extraTexts: Record<'sv' | 'en' | 'fi', { several: string; severalPlaceholder: string }> = {
  sv: { several: 'Kommuner', severalPlaceholder: 'Välj kommuner' },
  en: { several: 'Municipalities', severalPlaceholder: 'Choose municipalities' },
  fi: { several: 'Kunnat', severalPlaceholder: 'Valitse kunnat' },
}
const extraTextsFor = (locale: FormLocale) =>
  extraTexts[locale === 'sv' || locale === 'fi' ? locale : 'en']

interface MunicipalityListboxProps {
  text: ChoiceTexts
  items?: readonly Municipality[]
  name?: string
  defaultValue?: string | null
  defaultOpen?: boolean
  value?: string | null
  onValueChange?: (value: string | null) => void
}

/** A single-choice Listbox of municipalities. The popup parts are the same in every story. */
function MunicipalityListbox({
  text,
  items = municipalities,
  ...rootProps
}: MunicipalityListboxProps) {
  return (
    <Listbox.Root
      native="never"
      items={items}
      itemToString={(municipality) => municipality.name}
      itemToKey={(municipality) => municipality.code}
      isItemDisabled={(municipality) => municipality.disabled === true}
      {...rootProps}
    >
      <Listbox.Trigger>
        <Listbox.Value placeholder={text.municipalityPlaceholder} />
      </Listbox.Trigger>
      <Listbox.Popup>
        <Listbox.List>
          {(municipality: Municipality) => <Listbox.Option item={municipality} />}
        </Listbox.List>
        <Listbox.Empty />
      </Listbox.Popup>
    </Listbox.Root>
  )
}

/** A Listbox of several choices: the popup stays open, and the trigger lists what is chosen. */
function MunicipalitiesListbox({
  placeholder,
  defaultOpen,
  defaultValue,
  name,
}: {
  placeholder: string
  defaultOpen?: boolean
  defaultValue?: readonly string[]
  name?: string
}) {
  return (
    <Listbox.Root
      native="never"
      multiple
      items={municipalitiesWithClosed}
      itemToString={(municipality) => municipality.name}
      itemToKey={(municipality) => municipality.code}
      isItemDisabled={(municipality) => municipality.disabled === true}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(name === undefined ? {} : { name })}
    >
      <Listbox.Trigger>
        <Listbox.Value placeholder={placeholder} />
      </Listbox.Trigger>
      <Listbox.Popup>
        <Listbox.List>
          {(municipality: Municipality) => <Listbox.Option item={municipality} />}
        </Listbox.List>
      </Listbox.Popup>
    </Listbox.Root>
  )
}

type Canvas = ReturnType<typeof within>

/** The trigger of the single-choice listbox: its name is the label, then the value. */
const triggerOf = (canvas: Canvas, text: ChoiceTexts) =>
  canvas.getByRole('combobox', { name: new RegExp(text.municipality) })

/** A listbox in a Field: 44px high, a 1px edge, a drawn chevron and a 2px ring on keyboard focus. */
export const Default: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} name="municipality" />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const trigger = triggerOf(canvas, text)
    await expect(trigger.tagName).toBe('DIV')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expectMinimumTargetSize(trigger)
    await expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    await expect(canvas.getByRole('listbox')).toBeVisible()
    await userEvent.click(canvas.getByRole('option', { name: 'Göteborg' }))
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    await expect(trigger).toHaveFocus()
    await expect(trigger).toHaveTextContent('Göteborg')
  },
}

/**
 * The fixture the keyboard tests drive: a button, a listbox with a disabled option, a disabled
 * listbox, a listbox of several choices and a button in a form. Try the keys in the Keyboard
 * section above: Tab and Shift+Tab, the arrow keys, Home and End, Page Up and Page Down, Enter,
 * Space, Escape, Alt+ArrowDown and Alt+ArrowUp, and typing letters (try å, ä, ö and o).
 */
export const Keyboard: Story = {
  render: (_args, { globals }) => <KeyboardExample locale={localeOf(globals)} />,
}

function KeyboardExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const extra = extraTextsFor(locale)
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <div className="kv-button-group">
        <Button type="button">Före</Button>
      </div>
      <Field required controlId="municipality">
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} items={municipalitiesWithClosed} name="municipality" />
      </Field>
      <Field required disabled controlId="closed">
        <Label>{text.longSelectLabel}</Label>
        <MunicipalityListbox text={text} name="disabled" />
      </Field>
      <Field required controlId="several">
        <Label>{extra.several}</Label>
        <MunicipalitiesListbox placeholder={extra.severalPlaceholder} name="several" />
      </Field>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/** A chosen option shows in the closed trigger. */
export const Selected: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} defaultValue="malmö" />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(triggerOf(canvas, text)).toHaveTextContent('Malmö')
  },
}

/** Open from the start, with the chosen option marked. The popup is the browser's top layer, under the trigger. */
export const Open: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} defaultValue="malmö" defaultOpen />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(triggerOf(canvas, text)).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('option', { name: 'Malmö' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  },
}

/** The hint is in the trigger's description. */
export const WithDescription: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <Prose>
          <p>{text.municipalityHint}</p>
        </Prose>
        <MunicipalityListbox text={text} />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(triggerOf(canvas, text)).toHaveAccessibleDescription(text.municipalityHint)
  },
}

/** Optional: the label says so ("valfritt"), as for every field that isn't required. */
export const Optional: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field lang={lang}>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} />
      </Field>
    )
  },
}

/** Invalid: a 2px edge and the message under the listbox, with the choice kept as it was. */
export const Invalid: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required invalid lang={lang}>
        <Label>{text.municipality}</Label>
        <Prose>
          <p>{text.municipalityHint}</p>
        </Prose>
        <MunicipalityListbox text={text} />
        <ErrorMessage>{text.municipalityError}</ErrorMessage>
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const trigger = triggerOf(canvas, text)
    await expect(trigger).toHaveAttribute('aria-invalid', 'true')
    await expect(trigger).toHaveAttribute('aria-required', 'true')
    await expect(trigger).toHaveAttribute('data-invalid')
    await expect(trigger).toHaveAccessibleDescription(
      new RegExp(`${text.municipalityHint}.*${text.municipalityError}`),
    )
  },
}

/** Disabled: a dashed edge on the surface colour, no tab stop, and the popup never opens. */
export const Disabled: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required disabled lang={lang}>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} defaultValue="malmö" />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const trigger = triggerOf(canvas, text)
    await expect(trigger).toHaveAttribute('aria-disabled', 'true')
    await expect(trigger).not.toHaveAttribute('tabindex')
  },
}

/** A disabled option is reachable with the arrow keys, read as unavailable, and can't be chosen. */
export const DisabledOption: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} items={municipalitiesWithClosed} defaultOpen />
      </Field>
    )
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('option', { name: 'Stockholm' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/** Groups: `role="group"` named by its label. */
function GroupsListbox({ text, defaultOpen }: { text: ChoiceTexts; defaultOpen?: boolean }) {
  const groups = [
    {
      key: 'west',
      label: text.regionWest,
      items: [{ code: 'gothenburg', name: text.municipalityGothenburg }],
    },
    {
      key: 'east',
      label: text.regionEast,
      items: [
        { code: 'stockholm', name: text.municipalityStockholm },
        { code: 'uppsala', name: text.municipalityUppsala },
      ],
    },
    {
      key: 'south',
      label: text.regionSouth,
      items: [{ code: 'malmo', name: text.municipalityMalmo }],
    },
  ]
  return (
    <Listbox.Root
      native="never"
      groups={groups}
      itemToString={(municipality) => municipality.name}
      itemToKey={(municipality) => municipality.code}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
    >
      <Listbox.Trigger>
        <Listbox.Value placeholder={text.municipalityPlaceholder} />
      </Listbox.Trigger>
      <Listbox.Popup>
        <Listbox.List>
          {(municipality: { code: string; name: string }) => <Listbox.Option item={municipality} />}
        </Listbox.List>
      </Listbox.Popup>
    </Listbox.Root>
  )
}

export const Groups: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <GroupsListbox text={text} defaultOpen />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('group', { name: text.regionWest })).toBeVisible()
    await expect(canvas.getAllByRole('group')).toHaveLength(3)
  },
}

/** Several choices: the popup stays open, each option toggles, and the trigger lists the choice. */
export const Multiple: Story = {
  render: (_args, { globals }) => {
    const locale = localeOf(globals)
    const { lang } = choiceTextsFor(locale)
    const extra = extraTextsFor(locale)
    return (
      <Field required lang={lang}>
        <Label>{extra.several}</Label>
        <MunicipalitiesListbox
          placeholder={extra.severalPlaceholder}
          defaultValue={['malmö', 'uppsala']}
          defaultOpen
        />
      </Field>
    )
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
    await userEvent.click(canvas.getByRole('option', { name: 'Göteborg' }))
    await expect(canvas.getByRole('option', { name: 'Göteborg' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(canvas.getByRole('listbox')).toBeVisible()
  },
}

/** A long list scrolls inside the popup, which is never taller than the room that is left. */
export const LongList: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} items={longList} defaultOpen />
      </Field>
    )
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getAllByRole('option')).toHaveLength(300)
  },
}

/**
 * 10 000 options with `virtualize`: only the ones in view (and the active and chosen option) are in
 * the page, and every one says how big the list is and where it is in it (`aria-setsize`,
 * `aria-posinset`). Try End, Page Down, and typing å, ä, ö or o: the keys reach options that were
 * never rendered, and `aria-activedescendant` always points at one that is.
 */
export const Virtualized: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang} controlId="municipality">
        <Label>{text.municipality}</Label>
        <Listbox.Root
          native="never"
          virtualize
          items={virtualizedPlaces}
          itemToString={(place) => place.name}
          itemToKey={(place) => place.code}
          defaultOpen
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(place: VirtualizedPlace) => <Listbox.Option item={place} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field>
    )
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await waitFor(() => expect(canvas.getAllByRole('option').length).toBeGreaterThan(5))
    // Only a window is in the page, and the first option knows where it is in the whole list.
    await expect(canvas.getAllByRole('option').length).toBeLessThan(80)
    const [first] = canvas.getAllByRole('option')
    await expect(first).toHaveAttribute('aria-setsize', String(virtualizedCount))
    await expect(first).toHaveAttribute('aria-posinset', '1')
    await expect(canvas.queryByRole('option', { name: 'Österbo 250' })).toBeNull()
  },
}

/** A rich option: your own children replace the text. The name a screen reader reads is its text content. */
export const RichOptions: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <Listbox.Root
          native="never"
          items={richMunicipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          defaultOpen
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => (
                <Listbox.Option item={municipality}>
                  <span style={{ display: 'grid' }}>
                    <span>{municipality.name}</span>
                    <small style={{ color: 'var(--kv-listbox-option-hint)' }}>
                      {municipality.county}
                    </small>
                  </span>
                </Listbox.Option>
              )}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field>
    )
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('option', { name: /Göteborg/ })).toBeVisible()
  },
}

/** No options: `Listbox.Empty` says so in the locale. */
export const Empty: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} items={[]} defaultOpen />
      </Field>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    // Plain text beside a hidden listbox, not an option: no screen reader reads it as "option 1 of 1".
    await waitFor(() => expect(canvasElement.querySelector('.kv-listbox-empty')).toBeVisible())
    await expect(canvas.queryAllByRole('option')).toHaveLength(0)
  },
}

/**
 * The native rendering: `native="always"` (and `native="auto"` on touch devices) for a single
 * choice renders the browser's own `<select>`, wired to its Field. It takes plain text only, so
 * rich options and `Listbox.Empty` don't apply, and the open list is the browser's: its keys are
 * native. The option keys are the select's values.
 */
function useNativeItems(text: ChoiceTexts): readonly Municipality[] {
  return useMemo(
    () => [
      { code: 'gothenburg', name: text.municipalityGothenburg },
      { code: 'malmo', name: text.municipalityMalmo },
      { code: 'stockholm', name: text.municipalityStockholm },
      { code: 'uppsala', name: text.municipalityUppsala },
    ],
    [text],
  )
}

interface NativeListboxProps {
  text: ChoiceTexts
  name?: string
  defaultValue?: string | null
  value?: string | null
  disabled?: boolean
  onValueChange?: (value: string | null) => void
}

function NativeListbox({ text, name = 'municipality', ...rootProps }: NativeListboxProps) {
  const items = useNativeItems(text)
  return (
    <Listbox.Root
      native="always"
      items={items}
      itemToString={(municipality) => municipality.name}
      itemToKey={(municipality) => municipality.code}
      placeholder={text.municipalityPlaceholder}
      name={name}
      autoComplete="address-level2"
      {...rootProps}
    />
  )
}

const nativeSelectOf = (canvas: Canvas, text: ChoiceTexts) =>
  canvas.getByRole('combobox', { name: text.municipality })

/** A select in a Field: 44px high, a 1px edge, a drawn chevron and a 2px ring on keyboard focus. */
export const NativeDefault: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const select = nativeSelectOf(canvas, text)
    await expect(select.tagName).toBe('SELECT')
    await expect(select).toHaveAttribute('autocomplete', 'address-level2')
    await expectMinimumTargetSize(select)
    await expect(select.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
  },
}

/**
 * The fixture the native keyboard tests drive: a select, a disabled select and a button in a
 * form. Try the keys of the native rows in the Keyboard section above (the open list is the
 * browser's).
 */
export const NativeKeyboard: Story = {
  render: (_args, { globals }) => <NativeKeyboardExample locale={localeOf(globals)} />,
}

function NativeKeyboardExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <Field required>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} />
      </Field>
      <Field required disabled>
        <Label>{text.longSelectLabel}</Label>
        <NativeListbox text={text} name="disabled" />
      </Field>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/** A chosen option shows in the closed box. */
export const NativeSelected: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} defaultValue="stockholm" />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(nativeSelectOf(canvas, text)).toHaveValue('stockholm')
  },
}

/** The hint is in the select's description. */
export const NativeWithDescription: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <Prose>
          <p>{text.municipalityHint}</p>
        </Prose>
        <NativeListbox text={text} />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(nativeSelectOf(canvas, text)).toHaveAccessibleDescription(text.municipalityHint)
  },
}

/** Optional: the label says so ("valfritt"), as for every field that isn't required. */
export const NativeOptional: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field lang={lang}>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} />
      </Field>
    )
  },
}

/** Invalid: a 2px edge and the message under the select, with the choice kept as it was. */
export const NativeInvalid: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required invalid lang={lang}>
        <Label>{text.municipality}</Label>
        <Prose>
          <p>{text.municipalityHint}</p>
        </Prose>
        <NativeListbox text={text} />
        <ErrorMessage>{text.municipalityError}</ErrorMessage>
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const select = nativeSelectOf(canvas, text)
    await expect(select).toHaveAttribute('aria-invalid', 'true')
    await expect(select).toHaveAttribute('aria-required', 'true')
    await expect(select).toHaveAttribute('data-invalid')
    await expect(select).toHaveAccessibleDescription(
      new RegExp(`${text.municipalityHint}.*${text.municipalityError}`),
    )
  },
}

/** Disabled: a dashed edge on the surface colour, and the chevron is muted. */
export const NativeDisabled: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} disabled defaultValue="malmo" />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(nativeSelectOf(canvas, text)).toBeDisabled()
  },
}

/** Groups: `<optgroup label>` names each group of options. */
export const NativeGroups: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Field required lang={lang}>
        <Label>{text.municipality}</Label>
        <NativeGroupsListbox text={text} />
      </Field>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const select = nativeSelectOf(canvas, text)
    await expect(select.querySelectorAll('optgroup')).toHaveLength(3)
  },
}

function NativeGroupsListbox({ text }: { text: ChoiceTexts }) {
  const groups = useMemo(
    () => [
      {
        key: 'west',
        label: text.regionWest,
        items: [{ code: 'gothenburg', name: text.municipalityGothenburg }],
      },
      {
        key: 'east',
        label: text.regionEast,
        items: [
          { code: 'stockholm', name: text.municipalityStockholm },
          { code: 'uppsala', name: text.municipalityUppsala },
        ],
      },
      {
        key: 'south',
        label: text.regionSouth,
        items: [{ code: 'malmo', name: text.municipalityMalmo }],
      },
    ],
    [text],
  )
  return (
    <Listbox.Root
      native="always"
      groups={groups}
      itemToString={(municipality) => municipality.name}
      itemToKey={(municipality) => municipality.code}
      placeholder={text.municipalityPlaceholder}
      name="municipality"
    />
  )
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11), and the popup its own edge. */
export const OnSurfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Card.Root lang={lang}>
        <Field required invalid>
          <Label>{text.municipality}</Label>
          <MunicipalityListbox text={text} defaultOpen />
          <ErrorMessage>{text.municipalityError}</ErrorMessage>
        </Field>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(triggerOf(canvas, text)).toBeVisible()
  },
}

/** Staff density from 64rem: 32px high options and trigger, with the text still 16px. */
export const Compact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field required>
          <Label>{text.municipality}</Label>
          <MunicipalityListbox text={text} defaultOpen />
        </Field>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(triggerOf(canvas, text))
  },
}

/** A long Finnish label and a long option in a 320px column: both wrap, and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
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
        <Field required lang={lang}>
          <Label>{text.longSelectLabel}</Label>
          <MunicipalityListbox text={text} items={items} defaultValue="long" defaultOpen />
        </Field>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Controlled by your form state: this story's `useState` stands in for TanStack Form or React Hook Form. */
function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [value, setValue] = useState<string | null>('göteborg')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field required>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} value={value} onValueChange={setValue} />
      </Field>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value ?? '–'}
      </p>
    </div>
  )
}

/**
 * Controlled: the listbox shows the `value` it is given and calls `onValueChange(value, { reason })`
 * with the chosen key. It never copies the value into state, so a parent that refuses a change
 * leaves it as it was.
 */
export const Controlled: Story = {
  render: (_args, { globals }) => <ControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const trigger = triggerOf(canvas, text)
    await userEvent.click(trigger)
    await userEvent.click(canvas.getByRole('option', { name: 'Uppsala' }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: uppsala`)
    await expect(trigger).toHaveTextContent('Uppsala')
  },
}

/** An uncontrolled form: the hidden input carries the key, and the submit reads it by `name`. */
function PlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
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
      <Field required>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} name="municipality" defaultValue="göteborg" />
      </Field>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/** A plain `<form>`: no `value` and no handlers. The form's `FormData` has the key by `name` on submit. */
export const PlainForm: Story = {
  render: (_args, { globals }) => <PlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(triggerOf(canvas, text))
    await userEvent.click(canvas.getByRole('option', { name: 'Malmö' }))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: malmö`)
  },
}

/** Every state in one column, for the RTL and forced-colours stories. The popup is open on the first. */
function ListboxStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field required>
        <Label>{text.municipality}</Label>
        <Prose>
          <p>{text.municipalityHint}</p>
        </Prose>
        <MunicipalityListbox
          text={text}
          items={municipalitiesWithClosed.slice(0, 8)}
          defaultValue="ale"
          defaultOpen
        />
      </Field>
      <Field required invalid>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} />
        <ErrorMessage>{text.municipalityError}</ErrorMessage>
      </Field>
      <Field>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} />
      </Field>
      <Field required disabled>
        <Label>{text.municipality}</Label>
        <MunicipalityListbox text={text} defaultValue="malmö" />
      </Field>
    </div>
  )
}

/** Right to left, in English: the chevron and the tick are at the left, and the text starts at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <ListboxStates locale="en" />,
}

/** The edge, the invalid width, the active bar and the tick stay visible in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <ListboxStates locale={localeOf(globals)} />,
}

/** In a card: the select's edge keeps 3:1 against `surface-raised` (1.4.11). */
export const NativeOnSurfaces: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <Card.Root lang={lang}>
        <Field required invalid>
          <Label>{text.municipality}</Label>
          <NativeListbox text={text} />
          <ErrorMessage>{text.municipalityError}</ErrorMessage>
        </Field>
      </Card.Root>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(nativeSelectOf(canvas, text)).toBeVisible()
  },
}

/** Staff density from 64rem: 32px high, with the text still 16px. */
export const NativeCompact: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-compact" lang={lang}>
        <Field required>
          <Label>{text.municipality}</Label>
          <NativeListbox text={text} />
        </Field>
      </div>
    )
  },
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(nativeSelectOf(canvas, text))
  },
}

/** A long Finnish label in a 320px column: the label wraps, the select fills it, nothing overflows. */
export const NativeLongFinnish: Story = {
  globals: { locale: 'fi' },
  render: (_args, { globals }) => {
    const { text, lang } = choiceTextsFor(localeOf(globals))
    return (
      <div className="kv-story-narrow" data-testid="narrow">
        <Field required lang={lang}>
          <Label>{text.longSelectLabel}</Label>
          <NativeListbox text={text} />
        </Field>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

function NativeControlledExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [value, setValue] = useState<string | null>('gothenburg')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field required>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} value={value} onValueChange={setValue} />
      </Field>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value ?? '–'}
      </p>
    </div>
  )
}

/**
 * Controlled by your form state: the select shows the `value` it is given and reports changes
 * through `onValueChange`. It never copies the value into state.
 */
export const NativeControlled: Story = {
  render: (_args, { globals }) => <NativeControlledExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const select = nativeSelectOf(canvas, text)
    await userEvent.selectOptions(select, 'uppsala')
    await expect(select).toHaveValue('uppsala')
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: uppsala`)
  },
}

function NativePlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
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
      <Field required>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} defaultValue="gothenburg" />
      </Field>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/** A plain `<form>`: the select carries the `name`, and the form's `FormData` has the key on submit. */
export const NativePlainForm: Story = {
  render: (_args, { globals }) => <NativePlainFormExample locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.selectOptions(nativeSelectOf(canvas, text), 'malmo')
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: malmo`)
  },
}

/** Every native state in one column, for the RTL and forced-colours stories. */
function NativeStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field required>
        <Label>{text.municipality}</Label>
        <Prose>
          <p>{text.municipalityHint}</p>
        </Prose>
        <NativeListbox text={text} name="default" defaultValue="stockholm" />
      </Field>
      <Field required invalid>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} name="invalid" />
        <ErrorMessage>{text.municipalityError}</ErrorMessage>
      </Field>
      <Field>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} name="optional" />
      </Field>
      <Field required disabled>
        <Label>{text.municipality}</Label>
        <NativeListbox text={text} name="disabled" defaultValue="malmo" />
      </Field>
    </div>
  )
}

/** Right to left, in English: the select's chevron is at the left, and the text starts at the right. */
export const NativeRTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <NativeStates locale="en" />,
}

/** The select's edge, the invalid width and a native chevron stay visible in forced colours. */
export const NativeForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => <NativeStates locale={localeOf(globals)} />,
}
