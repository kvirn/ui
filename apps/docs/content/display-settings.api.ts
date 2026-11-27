import type {
  DisplaySettingsPanelProps,
  DisplaySettingsProps,
  UseDisplaySettingsOptions,
  UseDisplaySettingsResult,
} from '@kvirn/ui'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const messagesRow = {
  type: "Partial<KvirnMessages['displaySettings']>",
  default: '–',
  description:
    'Per-instance overrides for the texts: the button, the legends, the option names and the forced-colours note. Use it to name the button what your visitors call it.',
} as const

export const displaySettingsRows = propRows<DisplaySettingsProps>({
  messages: messagesRow,
  className: {
    type: 'string',
    default: '–',
    description:
      'Added to the button’s classes. A gap, a width or a colour is a class you add, never a prop.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'false',
    description: 'The panel or popup starts open.',
  },
  children: {
    type: 'ReactNode',
    default: '–',
    description:
      'Your own notes, after the three groups: what less motion does, or where the choice is kept. The component has none of its own.',
  },
})

export const displaySettingsPanelRows = propRows<DisplaySettingsPanelProps>({
  messages: messagesRow,
  className: {
    type: 'string',
    default: '–',
    description: 'Added to the classes of the panel’s <div>.',
  },
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'Your own notes, after the three groups.',
  },
})

export const displaySettingsInlineAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-display-settings-trigger',
    values: 'always, on the button',
    meaning: 'The part class. Your className goes after it.',
  },
  { name: 'aria-expanded', values: '"true" or "false"', meaning: 'Whether the panel is open.' },
  { name: 'aria-controls', values: 'the panel’s id', meaning: 'Points at the panel.' },
  {
    name: 'kv-display-settings-panel, kv-display-settings-card',
    values: 'always',
    meaning: 'The panel that opens in the page flow, and the Card inside it.',
  },
]

export const displaySettingsFloatingAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-display-settings-trigger, kv-display-settings-dropdown',
    values: 'always, on the button',
    meaning: 'The part classes. Your className goes after them.',
  },
  { name: 'aria-haspopup', values: '"dialog"', meaning: 'The button opens a dialog.' },
  { name: 'aria-expanded', values: '"true" or "false"', meaning: 'Whether the popup is open.' },
  { name: 'aria-controls', values: 'the popup’s id', meaning: 'Points at the popup.' },
  {
    name: 'role',
    values: '"dialog" on the popup',
    meaning: 'A dialog that does not block the page behind it. It is named by the button’s text.',
  },
  {
    name: 'kv-display-settings-popup, kv-display-settings-card',
    values: 'always',
    meaning: 'The popup, which is in the top layer, and the Card inside it.',
  },
]

export const displaySettingsCompactAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-display-settings-trigger, kv-display-settings-dropdown, kv-display-settings-compact-trigger',
    values: 'always, on the button',
    meaning: 'The part classes. Your className goes after them.',
  },
  { name: 'aria-haspopup', values: '"dialog"', meaning: 'The button opens a dialog.' },
  { name: 'aria-expanded', values: '"true" or "false"', meaning: 'Whether the popup is open.' },
  { name: 'aria-controls', values: 'the popup’s id', meaning: 'Points at the popup.' },
  {
    name: 'kv-display-settings-compact-popup',
    values: 'always',
    meaning: 'The small popup, which is in the top layer. It is named by the button’s text.',
  },
]

export const displaySettingsPanelAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-display-settings-content',
    values: 'always, on the <div>',
    meaning: 'The part class. Your className goes after it.',
  },
  {
    name: 'kv-display-settings-groups',
    values: 'always, on the <div> of the groups',
    meaning: 'Holds the three fieldsets.',
  },
]

export const displaySettingsCompactPanelAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-display-settings-content, kv-display-settings-content--compact',
    values: 'always, on the <div>',
    meaning: 'The part classes. Your className goes after them.',
  },
  {
    name: 'kv-display-settings-groups, kv-display-settings-groups--segments',
    values: 'always, on the <div> of the groups',
    meaning: 'Holds the three fieldsets.',
  },
  {
    name: 'kv-display-settings-segments',
    values: 'always, around the options of a group',
    meaning: 'The row of segments. Each segment is still a native radio.',
  },
]

export const useDisplaySettingsHook: ApiHook = {
  name: 'useDisplaySettings',
  intro:
    'The three display choices with their labels, for your own markup. It draws nothing. select saves a choice through the provider, in this browser only.',
  options: propRows<UseDisplaySettingsOptions>({
    messages: {
      type: "Partial<KvirnMessages['displaySettings']>",
      default: '–',
      description:
        'Per-instance overrides for the texts: the legends, the option names and the forced-colours note.',
    },
    short: {
      type: 'boolean',
      default: 'false',
      description:
        'Gives the “same as my device” option its short name, for a row of small segments.',
    },
  }),
  result: propRows<UseDisplaySettingsResult>({
    text: {
      type: "{ [key in keyof KvirnMessages['displaySettings']]: string }",
      default: '–',
      description: 'Every text of the display settings, already in the provider’s language.',
    },
    groups: {
      type: 'DisplaySettingsGroup[]',
      default: '–',
      description:
        'Three groups, in this order: colour scheme, contrast and motion. Each has id, name (for the radio group), legend, value (the choice in force), options (each with value and label) and select(value). select saves the choice through the provider and ignores a value that is not an option.',
    },
    isForcedColors: {
      type: 'boolean',
      default: '–',
      description:
        'The device uses its own colours, which replace these choices while they are on. Say so near the choices.',
    },
  }),
}
