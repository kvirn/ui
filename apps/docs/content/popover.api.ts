import type {
  PopoverCloseProps,
  PopoverPopupProps,
  PopoverRootProps,
  PopoverTriggerProps,
  UseDismissableLayerOptions,
  UsePopoverOptions,
  UsePopoverResult,
  UsePopupOptions,
  UsePopupResult,
} from '@kvirn/ui'
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

const asRow = {
  as: {
    type: 'ElementType',
    default: "'button'",
    description:
      'A component to render instead of the button, with its props set on the part: as={Button} className="kv-button--icon-only". It must be focusable, forward its ref and spread its props on a DOM node.',
  },
} as const

export const popoverTriggerRows = propRows<Pick<PopoverTriggerProps, 'as'>>(asRow)
export const popoverCloseRows = propRows<Pick<PopoverCloseProps, 'as'>>(asRow)

export const popoverPopupRows = propRows<Pick<PopoverPopupProps, 'as'>>({
  as: {
    type: "'div' | 'section'",
    default: "'div'",
    description:
      'The element the popup is. Any other tag warns once in development and falls back to a div. The role is dialog either way.',
  },
})

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

export const usePopupHook: ApiHook = {
  name: 'usePopup',
  intro:
    'Shows and hides a floating element and places it next to another one. Popover, Menu, Listbox, Combobox and Tooltip use it, and so can your own popup. It uses the browser’s popover attribute, so the element sits above the page and no parent’s overflow cuts it. It never moves focus, and you own the open state: pair it with useDismissableLayer for Escape and presses outside. Keep the popup element in the page while it is closed.',
  options: propRows<UsePopupOptions>({
    open: {
      type: 'boolean',
      description: 'Whether the popup is showing. You own this state.',
    },
    anchorRef: {
      type: 'RefObject<Element | null>',
      description:
        'What the popup sits next to, such as a Popover’s button or a Combobox’s input. The popup never covers it.',
    },
    popupRef: {
      type: 'RefObject<HTMLElement | null>',
      description: 'The popup’s element. Put the same ref on the element that gets popupProps.',
    },
    placement: {
      type: 'Placement',
      default: "'bottom-start'",
      description:
        'Where the popup goes when there is room. It moves to the other side when it does not fit. start and end follow the reading direction.',
    },
    offset: {
      type: 'number',
      default: '0',
      description: 'The gap between the anchor and the popup, in pixels.',
    },
    padding: {
      type: 'number',
      default: '0',
      description: 'The space kept between the popup and the edge of the screen, in pixels.',
    },
    matchAnchorWidth: {
      type: 'boolean',
      default: 'false',
      description: 'Makes the popup as wide as the anchor, as a list under its input.',
    },
    popover: {
      type: "'auto' | 'manual'",
      default: "'auto'",
      description:
        'auto lets the browser close the popup on Escape and on a press outside. manual leaves the closing to you: use it where focus stays in an input, as in a Combobox.',
    },
    onNativeDismiss: {
      type: '(event: Event) => void',
      default: '–',
      description:
        'Called when the browser hid the popup while open is still true: a light dismiss, or another auto popup opened. Set open to false here, so your state matches the page.',
    },
  }),
  result: propRows<UsePopupResult>({
    popupProps: {
      type: 'PopupPartProps',
      default: '–',
      description:
        'Spread on the popup element, next to its ref: popover, data-open, data-placement and data-detached. Name the popup and give it a role yourself.',
    },
    placement: {
      type: 'Placement',
      default: '–',
      description:
        'The placement in use. It differs from the one asked for when the popup flipped.',
    },
    reposition: {
      type: '() => void',
      default: '–',
      description:
        'Places the popup again. It already follows scrolling, resizing and a moving anchor, so call this only after you changed the popup’s content.',
    },
  }),
}

export const useDismissableLayerHook: ApiHook = {
  name: 'useDismissableLayer',
  intro:
    'Reports Escape and presses outside a floating layer. It returns nothing and only reports: your onDismiss closes the layer and, where the pattern says so, puts focus back. Open layers share one stack and only the top one reacts, so Escape closes the innermost layer first. Escape does nothing when the page already handled the key and called preventDefault().',
  options: propRows<UseDismissableLayerOptions>({
    open: {
      type: 'boolean',
      description: 'Whether the layer is showing. Only an open layer reacts.',
    },
    onDismiss: {
      type: "(reason: 'escape' | 'outside-press', event: Event) => void",
      description:
        'Called when the user dismisses the layer. It only asks: close the layer by setting open to false.',
    },
    ref: {
      type: 'RefObject<Element | null>',
      description: 'The layer’s element. A press inside it never dismisses it.',
    },
    ignore: {
      type: '((target: unknown) => boolean)[]',
      default: '–',
      description:
        'Checks for targets that count as inside although they are outside the element, such as the button that opens the layer or a Combobox’s input.',
    },
    dismissOnEscape: {
      type: 'boolean',
      default: 'true',
      description: 'Whether Escape dismisses this layer.',
    },
    dismissOnOutsidePress: {
      type: 'boolean',
      default: 'true',
      description:
        'Whether a press outside dismisses this layer. With false, the layer still shields the layers below it.',
    },
    passOutsidePressThrough: {
      type: 'boolean',
      default: 'false',
      description: 'With true, an outside press goes on to the layer below, as for a tooltip.',
    },
    backdrop: {
      type: 'boolean',
      default: 'false',
      description:
        'For a native <dialog> opened as a modal, whose backdrop is not an element: a press on the dialog itself but outside its box counts as outside.',
    },
  }),
}
