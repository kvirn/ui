import type {
  PopoverCloseProps,
  PopoverPopupProps,
  PopoverRootProps,
  PopoverTriggerProps,
  UsePopoverOptions,
  UsePopoverResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const popoverOptionRows = {
  open: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the popover is open. Pair it with onOpenChange.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the popover starts open.',
  },
  onOpenChange: {
    type: '(open: boolean, details: PopoverChangeDetails) => void',
    default: '–',
    description:
      'Called when the user opens or closes it. It only reports: with open set, you change open yourself. details.reason is trigger-press, close-press, escape, outside-press or light-dismiss, and details.event is the native event.',
  },
  placement: {
    type: 'Placement',
    default: "'bottom-start'",
    description:
      'Where the popup goes when there is room: top, bottom, start or end, with -start, -center or -end. It flips when it does not fit, and start and end follow the reading direction.',
  },
  offset: {
    type: 'number',
    default: '4',
    description: 'The gap between the trigger and the popup, in pixels.',
  },
  padding: {
    type: 'number',
    default: '8',
    description: 'The space kept to the edge of the viewport, in pixels.',
  },
  matchAnchorWidth: {
    type: 'boolean',
    default: 'false',
    description: 'Makes the popup as wide as the trigger.',
  },
} as const

export const popoverRootRows = propRows<PopoverRootProps>({
  ...popoverOptionRows,
  children: {
    type: 'ReactNode',
    default: '–',
    description: 'The Trigger and the Popup. Root renders no element.',
  },
})

const renderRow = (element: string) =>
  ({
    render: {
      type: `RenderProp<ComponentPropsWithRef<"${element}">, PopoverState>`,
      default: '–',
      description: `Changes the element, which must still be a <${element}>. A function receives the props and { isOpen }.`,
    },
  }) as const

export const popoverTriggerRows = propRows<Pick<PopoverTriggerProps, 'render'>>(renderRow('button'))
export const popoverPopupRows = propRows<Pick<PopoverPopupProps, 'render'>>(renderRow('div'))
export const popoverCloseRows = propRows<Pick<PopoverCloseProps, 'render'>>(renderRow('button'))

export const popoverTriggerAttributes: readonly AttributeRow[] = [
  { name: 'kv-popover-trigger', values: 'always', meaning: 'The part class.' },
  { name: 'aria-expanded', values: '"true" or "false"', meaning: 'Whether the popup is open.' },
  {
    name: 'aria-controls',
    values: 'the popup’s id',
    meaning: 'Points at the popup, which stays in the page while closed.',
  },
  { name: 'aria-haspopup', values: '"dialog"', meaning: 'The trigger opens a dialog.' },
  { name: 'data-open', values: 'present or absent', meaning: 'The popup is open.' },
]

export const popoverPopupAttributes: readonly AttributeRow[] = [
  { name: 'kv-popover-popup', values: 'always', meaning: 'The part class.' },
  {
    name: 'popover',
    values: '"auto"',
    meaning: 'Puts the popup in the top layer. The browser hides it while closed.',
  },
  {
    name: 'role',
    values: '"dialog"',
    meaning: 'A non-modal dialog. Name it with aria-label or aria-labelledby.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The popup is open.' },
  {
    name: 'data-placement',
    values: 'a Placement, such as bottom-start',
    meaning: 'The side the popup is on now, after it flipped.',
  },
  {
    name: 'data-detached',
    values: 'present or absent',
    meaning: 'The trigger is scrolled out of view. The popup is hidden until it comes back.',
  },
  {
    name: '--kv-popup-width, --kv-popup-max-height, --kv-anchor-width',
    values: 'lengths in px',
    meaning:
      'Set on the popup: the room it has and the trigger’s width. A long popup scrolls inside instead of leaving the screen.',
  },
  {
    name: '--kv-popup-width-limit, --kv-popup-height-limit',
    values: 'lengths you set',
    meaning: 'Cap the width and height of the popup below the room that is left.',
  },
]

export const popoverCloseAttributes: readonly AttributeRow[] = [
  { name: 'kv-popover-close', values: 'always', meaning: 'The part class.' },
]

export const usePopoverHook: ApiHook = {
  name: 'usePopover',
  options: propRows<UsePopoverOptions>(popoverOptionRows),
  result: propRows<UsePopoverResult>({
    isOpen: { type: 'boolean', default: '–', description: 'Whether the popover is open.' },
    placement: {
      type: 'Placement',
      default: '–',
      description:
        'The placement in use. It differs from the one asked for when the popup flipped.',
    },
    triggerProps: {
      type: 'PopoverTriggerPartProps',
      default: '–',
      description:
        'Spread on a <button>: type, aria-expanded, aria-controls, aria-haspopup, ref and handlers.',
    },
    popupProps: {
      type: 'PopoverPopupPartProps',
      default: '–',
      description:
        'Spread on a <div>: popover="auto", role="dialog", id, ref and the data attributes. Name it yourself.',
    },
    closeProps: {
      type: 'PopoverClosePartProps',
      default: '–',
      description: 'Spread on a <button> inside the popup that closes it.',
    },
  }),
}
