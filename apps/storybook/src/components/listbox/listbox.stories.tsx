import contract from '../../../../../packages/react/src/listbox/listbox.a11y.md?raw'
import guide from '../../../../../packages/react/src/listbox/listbox.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { choiceTextsFor, logChange } from '../form/choice.fixture.tsx'
import type { ChoiceTexts } from '../form/choice.fixture.tsx'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { virtualizedCount } from '../form/virtualized.fixture.ts'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  CompactMunicipality,
  ControlledMunicipality,
  ControlledOpenMunicipality,
  DisabledMunicipality,
  GroupedMunicipalities,
  InvalidMunicipality,
  KeyboardForm,
  LongFinnishMunicipality,
  LongMunicipalityList,
  MunicipalitiesWithOwnEmptyText,
  MunicipalityField,
  MunicipalityInCard,
  MunicipalityPlacedAbove,
  MunicipalityStates,
  MunicipalityWithClosedOption,
  MunicipalityWithDescription,
  NativeMunicipalities,
  NoMunicipalities,
  OpenMunicipality,
  OptionalMunicipality,
  PlainFormMunicipality,
  OwnMarkupMunicipalities,
  RichMunicipalities,
  SelectedMunicipality,
  SeveralMunicipalities,
  SeveralMunicipalitiesAsCount,
  VirtualizedPlaces,
  extraTextsFor,
} from './listbox.fixture.tsx'

// Components/Form/Listbox: the stylable popup (Listbox.Root, Trigger, Value, Popup, List, Option,
// Group, Empty), the APG select-only combobox (contract: listbox.a11y.md). Listbox.Root
// renders the browser's own <select> instead on touch devices (native="auto") and for
// native="always". The popup stories use native="never" so they show the popup on any device, and
// the Native story shows the native rendering with native="always".
//
// Every story renders a function of listbox.fixture.tsx, and its "Show code" prints that function
// (`showSource`): the real Listbox parts, ready to paste. Storybook's own snippet can't print the
// function child of Listbox.List or `itemToString`, which is why these are fixtures.
//
// KvirnUI holds no form state. The value is the chosen option's key: pass
// `value` and `onValueChange` (Controlled), or `defaultValue` and `name` for a plain form
// (PlainForm). Nothing here validates: an invalid story sets `invalid` itself. listbox.e2e.ts runs
// the keyboard rows, forced colours, reduced motion and reflow checks against these stories.

const description = usageGuide(guide)

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
  placement?: string
  offset?: number
  padding?: number
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
    open: { control: false, description: 'Controlled: whether the popup is open.' },
    defaultOpen: { control: false, description: 'Uncontrolled: whether it starts open.' },
    onOpenChange: {
      control: false,
      description:
        'Called with the new state and `{ reason }`: `trigger-press`, `option-press`, `key`, `escape`, `outside-press`, `blur` or `light-dismiss`.',
    },
    placement: {
      control: false,
      description:
        'Where the popup goes when there is room. Default `bottom-start`. It flips when it does not fit.',
    },
    offset: { control: false, description: 'The gap to the trigger in pixels. Default 4.' },
    padding: {
      control: false,
      description: 'The space kept to the edge of the viewport in pixels. Default 8.',
    },
    messages: {
      control: false,
      description:
        'Per-instance overrides of the `combobox` strings. `noResults` is the text of `Listbox.Empty`.',
    },
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

type Canvas = ReturnType<typeof within> // what `within` returns: the queries of a story's canvas

/** The trigger of the single-choice listbox: its name is the label, then the value. */
const triggerOf = (canvas: Canvas, text: ChoiceTexts) =>
  canvas.getByRole('combobox', { name: new RegExp(text.municipality) })

/** A listbox in a Field: 44px high, a 1px edge, a drawn chevron and a 2px ring on keyboard focus. */
export const Default: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'MunicipalityField'),
  render: () => <MunicipalityField />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('combobox', { name: /Kommun/ })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expectMinimumTargetSize(trigger)
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
  parameters: showSource('listbox/listbox.fixture.tsx', 'KeyboardForm'),
  render: (_args, { globals }) => <KeyboardForm locale={localeOf(globals)} />,
}

/** A chosen option shows in the closed trigger. */
export const Selected: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'SelectedMunicipality'),
  render: (_args, { globals }) => <SelectedMunicipality locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(triggerOf(canvas, text)).toHaveTextContent('Malmö')
  },
}

/** Open from the start, with the chosen option marked. The popup is the browser's top layer, under the trigger. */
export const Open: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'OpenMunicipality'),
  render: (_args, { globals }) => <OpenMunicipality locale={localeOf(globals)} />,
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

/** The help text is in the trigger's description. */
export const WithDescription: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'MunicipalityWithDescription'),
  render: (_args, { globals }) => <MunicipalityWithDescription locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(triggerOf(canvas, text)).toHaveAccessibleDescription(text.municipalityHint)
  },
}

/** Optional: the label says so ("valfritt"), as for every field that isn't required. */
export const Optional: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'OptionalMunicipality'),
  render: (_args, { globals }) => <OptionalMunicipality locale={localeOf(globals)} />,
}

/** Invalid: a 2px edge and the message under the listbox, with the choice kept as it was. */
export const Invalid: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'InvalidMunicipality'),
  render: (_args, { globals }) => <InvalidMunicipality locale={localeOf(globals)} />,
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
  parameters: showSource('listbox/listbox.fixture.tsx', 'DisabledMunicipality'),
  render: (_args, { globals }) => <DisabledMunicipality locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const trigger = triggerOf(canvas, text)
    await expect(trigger).toHaveAttribute('aria-disabled', 'true')
    await expect(trigger).not.toHaveAttribute('tabindex')
  },
}

/** A disabled option is reachable with the arrow keys, read as unavailable, and can't be chosen. */
export const DisabledOption: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'MunicipalityWithClosedOption'),
  render: (_args, { globals }) => <MunicipalityWithClosedOption locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('option', { name: 'Stockholm' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/** Groups: `role="group"` named by its label. */
export const Groups: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'GroupedMunicipalities'),
  render: (_args, { globals }) => <GroupedMunicipalities locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('group', { name: text.regionWest })).toBeVisible()
    await expect(canvas.getAllByRole('group')).toHaveLength(3)
  },
}

/** Several choices: the popup stays open, each option toggles, and the trigger lists the choice. */
export const Multiple: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'SeveralMunicipalities'),
  render: (_args, { globals }) => <SeveralMunicipalities locale={localeOf(globals)} />,
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
  parameters: showSource('listbox/listbox.fixture.tsx', 'LongMunicipalityList'),
  render: (_args, { globals }) => <LongMunicipalityList locale={localeOf(globals)} />,
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
  parameters: showSource('listbox/listbox.fixture.tsx', 'VirtualizedPlaces'),
  render: (_args, { globals }) => <VirtualizedPlaces locale={localeOf(globals)} />,
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

/** A rich option: an icon, the text that names it, a second line that describes it and a mark for the chosen one. */
export const RichOptions: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'RichMunicipalities'),
  render: (_args, { globals }) => <RichMunicipalities locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    const option = canvas.getByRole('option', { name: 'Göteborg' })
    await expect(option).toBeVisible()
    await expect(option).toHaveAccessibleDescription('Västra Götaland')
  },
}

/** Your own markup, no parts: icons, divs and spans go inside the option, and the trigger shows the chosen one's markup. */
export const OwnMarkup: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'OwnMarkupMunicipalities'),
  render: (_args, { globals }) => <OwnMarkupMunicipalities locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvas.getByRole('option', { name: /Göteborg/ })).toBeVisible()
  },
}

/** No options: `Listbox.Empty` says so in the locale. */
export const Empty: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'NoMunicipalities'),
  render: (_args, { globals }) => <NoMunicipalities locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    // Plain text beside a hidden listbox, not an option: no screen reader reads it as "option 1 of 1".
    await waitFor(() => expect(canvasElement.querySelector('.kv-listbox-empty')).toBeVisible())
    await expect(canvas.queryAllByRole('option')).toHaveLength(0)
  },
}

/**
 * Your own empty text: `messages={{ noResults }}` on the Root replaces the default text of
 * `Listbox.Empty` for this listbox. The provider's `messages` change it for all of them.
 */
export const OwnEmptyText: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'MunicipalitiesWithOwnEmptyText'),
  render: (_args, { globals }) => <MunicipalitiesWithOwnEmptyText locale={localeOf(globals)} />,
  play: async ({ canvasElement, globals }) => {
    const extra = extraTextsFor(localeOf(globals))
    await waitFor(() => expect(canvasElement.querySelector('.kv-listbox-empty')).toBeVisible())
    await expect(canvasElement.querySelector('.kv-listbox-empty')).toHaveTextContent(
      extra.noneMessage,
    )
  },
}

/**
 * The chosen options as your own text: a function child of `Listbox.Value` gets the chosen items,
 * here to show a count. The trigger's name is the Field's label followed by that text.
 */
export const ValueAsCount: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'SeveralMunicipalitiesAsCount'),
  render: (_args, { globals }) => <SeveralMunicipalitiesAsCount locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const extra = extraTextsFor(localeOf(globals))
    const trigger = canvas.getByRole('combobox', { name: new RegExp(extra.several) })
    await expect(trigger).toHaveTextContent(extra.selectedCount(2))
    await userEvent.click(trigger)
    await userEvent.click(await canvas.findByRole('option', { name: 'Göteborg' }))
    await waitFor(() => expect(trigger).toHaveTextContent(extra.selectedCount(3)))
  },
}

/**
 * The popup above the trigger, with your own gap and edge distance: `placement`, `offset` and
 * `padding`. It flips to the other side when there is no room, and `data-placement` says which
 * side it is on.
 */
export const PlacedAbove: Story = {
  decorators: [
    (Story) => (
      <div style={{ paddingBlockStart: '18rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: showSource('listbox/listbox.fixture.tsx', 'MunicipalityPlacedAbove'),
  render: (_args, { globals }) => <MunicipalityPlacedAbove locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(triggerOf(canvas, text))
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expect(canvasElement.querySelector('.kv-listbox-popup')).toHaveAttribute(
      'data-placement',
      'top-start',
    )
  },
}

/**
 * Controlled by your state: the popup shows the `open` it is given, and `onOpenChange(open, { reason })`
 * says why every request came: the trigger, an option, Escape or a press outside. With `open` set,
 * nothing opens or closes until you change it.
 */
export const ControlledOpen: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'ControlledOpenMunicipality'),
  render: (_args, { globals }) => <ControlledOpenMunicipality locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const trigger = triggerOf(canvas, text)
    const state = canvas.getByTestId('open')
    await userEvent.click(trigger)
    await waitFor(() => expect(state).toHaveTextContent('open: true, reason: trigger-press'))
    await userEvent.click(await canvas.findByRole('option', { name: 'Malmö' }))
    await waitFor(() => expect(state).toHaveTextContent('open: false, reason: option-press'))
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(state).toHaveTextContent('open: false, reason: escape'))
    await userEvent.click(trigger)
    await waitFor(() => expect(state).toHaveTextContent('open: true, reason: trigger-press'))
    await userEvent.click(canvas.getByRole('button', { name: 'Före' }))
    await waitFor(() => expect(state).toHaveTextContent('open: false, reason: outside-press'))
  },
}

/**
 * The native rendering: `native="always"` (and `native="auto"` on touch devices) for a single
 * choice renders the browser's own `<select>`, wired to its Field, with the same `items`, `groups`,
 * `value`, `defaultValue`, `onValueChange` and `name` as the popup. Here are one with nothing
 * chosen, one chosen, `groups` as `<optgroup>`s, an invalid one and a disabled one. It takes plain
 * text only, so rich options and `Listbox.Empty` don't apply, and the open list is the browser's:
 * try the native keys of the Keyboard section above.
 */
export const Native: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'NativeMunicipalities'),
  render: (_args, { globals }) => <NativeMunicipalities locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const selects = canvas.getAllByRole('combobox')
    await expect(selects).toHaveLength(5)
    for (const select of selects) {
      await expect(select.tagName).toBe('SELECT')
      await expectMinimumTargetSize(select)
    }
    const [empty, chosen, grouped, invalid, disabled] = selects
    await expect(empty).toHaveValue('')
    await expect(empty).toHaveAttribute('autocomplete', 'address-level2')
    await expect(chosen).toHaveValue('stockholm')
    await expect(grouped?.querySelectorAll('optgroup')).toHaveLength(3)
    await expect(invalid).toHaveAttribute('aria-invalid', 'true')
    await expect(invalid).toHaveAttribute('aria-required', 'true')
    await expect(invalid).toHaveAttribute('data-invalid')
    await expect(invalid).toHaveAccessibleDescription(
      new RegExp(`${text.municipalityHint}.*${text.municipalityError}`),
    )
    await expect(disabled).toBeDisabled()
  },
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11), and the popup its own edge. */
export const OnSurfaces: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'MunicipalityInCard'),
  render: (_args, { globals }) => <MunicipalityInCard locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expect(triggerOf(canvas, text)).toBeVisible()
  },
}

/** Staff density from 64rem: 32px high options and trigger, with the text still 16px. */
export const Compact: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'CompactMunicipality'),
  render: (_args, { globals }) => <CompactMunicipality locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await expectMinimumTargetSize(triggerOf(canvas, text))
  },
}

/** A long Finnish label and a long option in a 320px column: both wrap, and nothing overflows. */
export const LongFinnish: Story = {
  globals: { locale: 'fi' },
  decorators: [
    (Story) => (
      <div
        className="kv-story-narrow"
        data-testid="narrow"
        style={{ paddingInline: 'var(--kv-space-4)' }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: showSource('listbox/listbox.fixture.tsx', 'LongFinnishMunicipality'),
  render: (_args, { globals }) => <LongFinnishMunicipality locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('listbox')).toBeVisible())
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * Controlled: the listbox shows the `value` it is given and calls `onValueChange(value, { reason })`
 * with the chosen key. It never copies the value into state, so a parent that refuses a change
 * leaves it as it was.
 */
export const Controlled: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'ControlledMunicipality'),
  render: (_args, { globals }) => <ControlledMunicipality locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    const trigger = triggerOf(canvas, text)
    await userEvent.click(trigger)
    await userEvent.click(canvas.getByRole('option', { name: 'Uppsala' }))
    await expect(canvas.getByTestId('mirror')).toHaveTextContent(`${text.youChose}: uppsala`)
    await expect(trigger).toHaveTextContent('Uppsala')
  },
}

/** A plain `<form>`: no `value` and no handlers. The form's `FormData` has the key by `name` on submit. */
export const PlainForm: Story = {
  parameters: showSource('listbox/listbox.fixture.tsx', 'PlainFormMunicipality'),
  render: (_args, { globals }) => <PlainFormMunicipality locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = choiceTextsFor(localeOf(globals))
    await userEvent.click(triggerOf(canvas, text))
    await userEvent.click(canvas.getByRole('option', { name: 'Malmö' }))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(canvas.getByTestId('sent')).toHaveTextContent(`${text.sent}: malmö`)
  },
}

/** Right to left, in English: the chevron and the tick are at the left, and the text starts at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('listbox/listbox.fixture.tsx', 'MunicipalityStates'),
  render: () => <MunicipalityStates locale="en" />,
}

/** The edge, the invalid width, the active bar and the tick stay visible in forced colours. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('listbox/listbox.fixture.tsx', 'MunicipalityStates'),
  render: (_args, { globals }) => <MunicipalityStates locale={localeOf(globals)} />,
}
