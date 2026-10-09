import type { FocusScopeProps, UseFocusOptions, UseFocusResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const useFocusRows = propRows<UseFocusOptions>({
  active: {
    type: 'boolean',
    default: 'false',
    description:
      'Whether the scope is showing. Focus moves in when it becomes true and returns when it becomes false.',
  },
  restore: {
    type: 'boolean',
    default: 'true',
    description:
      'Returns focus when active ends. Focus the user moved elsewhere is never taken back, and focus never goes to body.',
  },
  finalFocusRef: {
    type: 'RefObject<HTMLElement | null>',
    default: '–',
    description:
      'Where focus returns first. After it come triggerRef, then the element that had focus before the scope.',
  },
  triggerRef: {
    type: 'RefObject<HTMLElement | null>',
    default: '–',
    description: 'The element that opened the scope, when it is not the one that had focus.',
  },
  initialFocus: {
    type: "'first' | 'container' | 'none' | string | RefObject<HTMLElement | null>",
    default: "'first'",
    description:
      'Where focus goes when active becomes true: the first Tab stop, the scope itself, nowhere, a selector or a ref. A target that is gone or disabled falls through to the first stop, then the scope.',
  },
  contain: {
    type: "false | 'loop' | 'inert'",
    default: 'false',
    description:
      '"loop" wraps Tab and Shift+Tab at the ends of the scope. "inert" makes the rest of the page inert while active. Both need a way out: pass onEscape.',
  },
  onEscape: {
    type: '(event: KeyboardEvent<HTMLElement>) => void',
    default: '–',
    description:
      'Called on Escape inside the scope when contain is set. You close the scope. Without it a development warning says the user has no way out.',
  },
  moveOn: {
    type: '{ key: string; selector?: string; containerRef?: RefObject<Element | null> }',
    default: '–',
    description:
      'Moves focus to selector (default "h1") when key changes, never on the first render. For a wizard step or a route. Works with or without active.',
  },
  onLost: {
    type: '() => void',
    default: '–',
    description:
      'Called when nothing could take focus: the return found no target, or moveOn found no element.',
  },
})

export type FocusScopeDocumentedProps = UseFocusOptions & Pick<FocusScopeProps, 'as' | 'ref'>

export const focusScopeRows = propRows<FocusScopeDocumentedProps>({
  ...useFocusRows,
  as: {
    type: "'div' | 'section' | 'aside' | 'nav' | 'form'",
    default: "'div'",
    description:
      'Changes the element. FocusScope adds no role or ARIA, so nav and form are landmarks and need a name from you. Another tag warns once and renders a div.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the element, whichever it is.',
  },
})

export const useFocusResultRows = propRows<UseFocusResult>({
  scopeProps: {
    type: '{ ref: RefObject<HTMLElement | null>; onKeyDown: (event) => void }',
    default: '–',
    description: 'Spread on the scope’s element: its ref, and the keys for contain and onEscape.',
  },
  captureOpener: {
    type: '() => void',
    default: '–',
    description:
      'Call it just before showing the scope when focus is read earlier than active flips. Optional: active captures it too.',
  },
  wasFocusSeen: {
    type: '() => boolean',
    default: '–',
    description: 'true once focus was in the scope or a real opener existed.',
  },
  focusFirstAvailable: {
    type: '(candidates) => boolean',
    default: '–',
    description: 'Focuses the first candidate that takes focus, never body. false when none does.',
  },
  isFocusTarget: {
    type: '(element) => boolean',
    default: '–',
    description: 'Whether an element can take focus now: in the document, enabled and not inert.',
  },
})

export const focusScopeAttributes: readonly AttributeRow[] = [
  {
    name: 'tabindex="-1"',
    values: 'while the scope itself has focus',
    meaning: 'Added so the scope can take focus without becoming a Tab stop, and removed on blur.',
  },
  {
    name: 'inert',
    values: 'on the siblings of the scope and its ancestors',
    meaning:
      'Set with contain="inert" while active and removed after. Live regions and the Toast region are left alone.',
  },
]
