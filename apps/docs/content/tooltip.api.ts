import type {
  TooltipNameProps,
  TooltipRootProps,
  TooltipShortcutProps,
  TooltipTriggerProps,
  UseTooltipOptions,
  UseTooltipResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const tooltipOptionRows = {
  open: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the tooltip is open. Pair it with onOpenChange.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the tooltip starts open.',
  },
  onOpenChange: {
    type: '(open: boolean, details: TooltipChangeDetails) => void',
    default: '–',
    description:
      'Called when the user opens or closes it. It only reports: with open set, you change open yourself. details.reason is hover, focus, escape, pointer-leave, blur or trigger-press.',
  },
  placement: {
    type: 'Placement',
    default: "'top'",
    description:
      'Where the tooltip goes when there is room: top, bottom, start or end, with -start, -center or -end. It flips when it does not fit.',
  },
  offset: {
    type: 'number',
    default: '4',
    description: 'The gap between the trigger and the tooltip, in pixels.',
  },
  padding: {
    type: 'number',
    default: '8',
    description: 'The space kept to the edge of the viewport, in pixels.',
  },
  delay: {
    type: 'number',
    default: '500',
    description:
      'Milliseconds the pointer rests on the trigger before the tooltip opens. Keyboard focus opens it at once.',
  },
  closeDelay: {
    type: 'number',
    default: '100',
    description: 'Milliseconds after the pointer leaves before the tooltip closes.',
  },
  group: {
    type: 'TooltipGroup',
    default: 'one group for the page',
    description:
      'Where tooltips share their delay: once one has opened, the next opens at once. Make a separate group with createTooltipGroup() from @kvirn-ui/core.',
  },
} as const

export const tooltipRootRows = propRows<TooltipRootProps>({
  ...tooltipOptionRows,
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'The Trigger and the Popup. Root renders no element.',
  },
})

export const tooltipTriggerRows = propRows<Pick<TooltipTriggerProps, 'as'>>({
  as: {
    type: 'ElementType',
    default: "'button'",
    description:
      'The control the tooltip belongs to, such as as={Button} aria-label="Search", with its props set on the Trigger. It must be focusable, forward its ref, spread its props on a DOM node and have a name of its own.',
  },
})
export const tooltipNameRows = propRows<Pick<TooltipNameProps, 'as'>>({
  as: {
    type: "'span' | 'strong'",
    default: "'span'",
    description: 'Changes the element. Another tag warns once in development.',
  },
})
export const tooltipShortcutRows = propRows<Pick<TooltipShortcutProps, 'as'>>({
  as: {
    type: "'span' | 'small'",
    default: "'span'",
    description: 'Changes the element. Another tag warns once in development.',
  },
})

export const tooltipTriggerAttributes: readonly AttributeRow[] = [
  {
    name: 'aria-describedby',
    values: 'an id, joined with yours',
    meaning:
      'Points at the whole popup, or at Tooltip.Shortcut when there is one. Absent when the tooltip only repeats the name.',
  },
]

export const tooltipPopupAttributes: readonly AttributeRow[] = [
  { name: 'kv-tooltip', values: 'always', meaning: 'The part class.' },
  {
    name: 'popover',
    values: '"manual"',
    meaning:
      'Puts the tooltip in the top layer. The browser hides it while closed, and it never takes part in light dismiss.',
  },
  { name: 'role', values: '"tooltip"', meaning: 'The tooltip role.' },
  {
    name: 'aria-hidden',
    values: '"true" or absent',
    meaning:
      'Set when the popup holds only Tooltip.Name: it adds nothing for assistive technology.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The tooltip is open.' },
  {
    name: 'data-placement',
    values: 'a Placement, such as top',
    meaning: 'The side the tooltip is on now, after it flipped.',
  },
  {
    name: 'data-detached',
    values: 'present or absent',
    meaning: 'The trigger is scrolled out of view. The tooltip is hidden until it comes back.',
  },
  {
    name: '--kv-popup-width, --kv-popup-max-height, --kv-anchor-width',
    values: 'lengths in px',
    meaning: 'Set on the popup: the room it has and the trigger’s width.',
  },
  {
    name: '--kv-popup-width-limit, --kv-popup-height-limit',
    values: 'lengths you set',
    meaning: 'Cap the width and height of the tooltip below the room that is left.',
  },
]

export const tooltipNameAttributes: readonly AttributeRow[] = [
  { name: 'kv-tooltip-name', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-hidden',
    values: '"true"',
    meaning: 'The name is hidden from assistive technology, so it is heard once, from the trigger.',
  },
]

export const tooltipShortcutAttributes: readonly AttributeRow[] = [
  { name: 'kv-tooltip-shortcut', values: 'always', meaning: 'The part class.' },
  {
    name: 'id',
    values: 'generated',
    meaning: 'The trigger’s aria-describedby points at it.',
  },
]

export const useTooltipHook: ApiHook = {
  name: 'useTooltip',
  options: propRows<UseTooltipOptions>({
    ...tooltipOptionRows,
    description: {
      type: "'popup' | 'shortcut' | 'none'",
      default: "'popup'",
      description:
        'What the trigger’s aria-describedby points at: the whole popup, only the part with shortcutProps, or nothing (the whole popup is then aria-hidden). Tooltip.Root works this out from the parts it holds.',
    },
  }),
  result: propRows<UseTooltipResult>({
    isOpen: { type: 'boolean', default: '–', description: 'Whether the tooltip is open.' },
    placement: {
      type: 'Placement',
      default: '–',
      description:
        'The placement in use. It differs from the one asked for when the tooltip flipped.',
    },
    triggerProps: {
      type: 'TooltipTriggerPartProps',
      default: '–',
      description:
        'Spread on the control: ref, aria-describedby and the pointer and focus handlers. Join your own aria-describedby with it.',
    },
    popupProps: {
      type: 'TooltipPopupPartProps',
      default: '–',
      description:
        'Spread on a <div>: popover="manual", role="tooltip", id, ref and the data attributes.',
    },
    nameProps: {
      type: 'TooltipNamePartProps',
      default: '–',
      description: 'Spread on the element that repeats the trigger’s name: aria-hidden.',
    },
    shortcutProps: {
      type: 'TooltipShortcutPartProps',
      default: '–',
      description: 'Spread on the element that adds information, such as the shortcut: its id.',
    },
  }),
}
