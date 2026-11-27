import type {
  TagGroupClearAllProps,
  TagRemoveProps,
  UseTagGroupOptions,
  UseTagGroupResult,
} from '@kvirn/ui'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const tagGroupOptionRows = propRows<UseTagGroupOptions>({
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

export const tagGroupRootRows = tagGroupOptionRows

export const tagGroupClearAllRows = propRows<Pick<TagGroupClearAllProps, 'onClear' | 'children'>>({
  onClear: {
    type: '() => void',
    description:
      'Remove every tag. Your state must change in the same event, because focus is placed after the render that follows the click. Announce the result yourself: Clear all says nothing.',
  },
  children: {
    type: 'ReactNode',
    default: 'filters.clearAll',
    description:
      'The text of the button. The default, “Clear all filters”, is for groups of filters. Pass your own text for anything else.',
  },
})

export const tagRemoveRows = propRows<
  Pick<TagRemoveProps, 'children' | 'label' | 'onRemove' | 'messages'>
>({
  children: {
    type: 'ReactNode',
    description: 'The text of the tag. It is drawn in the button, so the whole chip is the target.',
  },
  label: {
    type: 'string',
    default: 'children, when it is a string',
    description:
      'The text the button’s name uses: “Remove {label}”. Give it when children is not a string, and keep it equal to what is shown (2.5.3 Label in Name). Without it and without a string, the button has no name and a warning is logged in development.',
  },
  onRemove: {
    type: '() => void',
    description:
      'Remove the tag. Your state must change in the same event: focus is placed after the render that follows the click.',
  },
  messages: {
    type: "Partial<KvirnMessages['tag']>",
    default: 'the group’s messages',
    description: 'Replaces the tag texts for this tag only.',
  },
})

export const tagGroupRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-tag-group', values: 'always', meaning: 'The part class.' },
]

export const tagGroupLabelAttributes: readonly AttributeRow[] = [
  { name: 'kv-tag-group-label', values: 'always', meaning: 'The part class.' },
  {
    name: 'id',
    values: 'generated',
    meaning: 'The list points at it with aria-labelledby.',
  },
  {
    name: 'tabindex',
    values: '"-1"',
    meaning: 'Added only when the label receives focus as the fallback, after the last tag goes.',
  },
]

export const tagGroupListAttributes: readonly AttributeRow[] = [
  { name: 'kv-tag-group-list', values: 'always', meaning: 'The part class.' },
  {
    name: 'role',
    values: '"list"',
    meaning: 'Keeps the list a list in Safari with VoiceOver, where the theme removes the bullets.',
  },
  { name: 'aria-labelledby', values: 'the label’s id', meaning: 'Names the list.' },
]

export const tagGroupEmptyAttributes: readonly AttributeRow[] = [
  { name: 'kv-tag-group-empty', values: 'always', meaning: 'The part class.' },
]

export const tagRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-tag', values: 'always', meaning: 'The part class.' },
]

export const tagLabelAttributes: readonly AttributeRow[] = [
  { name: 'kv-tag-label', values: 'always', meaning: 'The part class.' },
]

export const tagRemoveAttributes: readonly AttributeRow[] = [
  { name: 'kv-tag-remove', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-kv-tag-remove',
    values: 'always, empty',
    meaning:
      'Marks the button, so the group can find the remove buttons around a removed tag. Put it on your own button when you use useTagGroup.',
  },
  {
    name: 'aria-label',
    values: '“Remove {label}”',
    meaning: 'The name. It contains the visible text.',
  },
  {
    name: 'kv-tag-remove-icon',
    values: 'class of the cross, a span with aria-hidden',
    meaning: 'The cross. It is decoration: the name is on the button.',
  },
]

export const useTagGroupHook: ApiHook = {
  name: 'useTagGroup',
  intro:
    'The focus rule and the removal announcement for your own markup. Put the label’s id and ref on your label, and the list’s ref on your list. Mark each remove button with data-kv-tag-remove.',
  options: tagGroupOptionRows,
  result: propRows<UseTagGroupResult>({
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
      description:
        'Put on the list, so the group can find the remove buttons around a removed tag.',
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
  }),
}
