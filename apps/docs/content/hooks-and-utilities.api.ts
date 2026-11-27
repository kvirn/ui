import type {
  UseDisplaySettingsOptions,
  UseDisplaySettingsResult,
  UseTagGroupOptions,
  UseTagGroupResult,
} from '@kvirn/ui'
import { propRows } from '../components/api-block.tsx'

export const useDisplaySettingsOptionRows = propRows<UseDisplaySettingsOptions>({
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
})

export const useDisplaySettingsResultRows = propRows<UseDisplaySettingsResult>({
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
})

export const useTagGroupOptionRows = propRows<UseTagGroupOptions>({
  announceRemoval: {
    type: 'boolean',
    default: 'true',
    description:
      'Says “{label} removed.” politely when a tag is removed. Turn it off when you announce one combined message yourself, because the live region keeps only the last message.',
  },
  focusFallback: {
    type: '() => HTMLElement | null',
    default: '–',
    description:
      'Where focus goes when no remove button is left. Return a button, or an element with tabindex="-1", that is in the page after the removal. Without it, focus goes to the group’s label. If your element cannot take focus, the label is used.',
  },
  messages: {
    type: "Partial<KvirnMessages['tag']>",
    default: '–',
    description: 'Per-instance overrides for the tag texts: remove and removed.',
  },
})

export const useTagGroupResultRows = propRows<UseTagGroupResult>({
  labelId: {
    type: 'string',
    default: '–',
    description: 'The id for the label. Set it on the label and as aria-labelledby on the list.',
  },
  labelRef: {
    type: 'RefCallback<HTMLElement>',
    default: '–',
    description: 'Put on the label. It is where focus goes after the last tag is removed.',
  },
  listRef: {
    type: 'RefCallback<HTMLElement>',
    default: '–',
    description: 'Put on the list, so the group can find the remove buttons around a removed tag.',
  },
  hasItems: {
    type: 'boolean',
    default: '–',
    description: 'Whether the list has a tag. Use it for the empty text and for Clear all.',
  },
  setHasItems: {
    type: '(hasItems: boolean) => void',
    default: '–',
    description:
      'Tell the group whether your list has tags. The TagGroup.List part does this for you.',
  },
  prepareRemoval: {
    type: '(button: HTMLElement, label: string | undefined) => void',
    default: '–',
    description:
      'Call it first in a remove button’s click handler, then change your state in the same event. It notes the neighbouring button, announces the removal and moves focus after the next render: to the next remove button, else the previous, else the fallback.',
  },
  prepareClear: {
    type: '() => void',
    default: '–',
    description:
      'The same for a button that removes every tag: focus goes to the fallback. Change your state in the same event.',
  },
  messages: {
    type: "ResolvedMessages<KvirnMessages['tag']>",
    default: '–',
    description:
      'The tag texts in the provider’s language. messages.remove({ label }) is the name of a remove button.',
  },
})
