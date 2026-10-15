import type {
  QuickExitHintProps,
  QuickExitLinkProps,
  QuickExitRootProps,
  UseQuickExitOptions,
  UseQuickExitResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const shortcutRow = {
  type: 'boolean',
  default: 'true',
  description:
    'Pressing Shift three times, from anywhere on the page, leaves it, also in a text field. A Shift counts when it is released, and only if nothing else was pressed while it was down, so Shift+Tab, a capital letter or Shift+click is not a press. false adds no key listener at all, so nothing is counted or announced, QuickExit.Hint renders nothing and the link is the only way. Mount only one QuickExit with the shortcut on per page: a second one warns in development.',
}

const navigateRow = {
  type: '(href: string) => void',
  default: 'window.location.replace(href)',
  description:
    'How the page is left. It gets the full address, and the page is already hidden. Use it only for a full navigation that replaces the history entry, or for a function that just reports, as the examples on this page do. A router push keeps the entry and leaves a blank page.',
}

const windowMsRow = {
  type: 'number',
  default: '5000',
  description:
    'The longest gap between two Shift presses, in milliseconds. A longer gap starts the count again.',
}

const messagesRow = {
  type: "Partial<KvirnMessages['quickExit']>",
  default: '–',
  description:
    'Overrides the texts for this instance: { label, hint, shortcutRemaining }. The provider’s language is the default.',
}

export type QuickExitRootDocumentedProps = Pick<
  QuickExitRootProps,
  'shortcut' | 'navigate' | 'windowMs' | 'messages'
>

export const quickExitRootRows = propRows<QuickExitRootDocumentedProps>({
  shortcut: shortcutRow,
  navigate: navigateRow,
  windowMs: windowMsRow,
  messages: messagesRow,
})

export type QuickExitLinkDocumentedProps = Pick<QuickExitLinkProps, 'href' | 'children' | 'as'>

export const quickExitLinkRows = propRows<QuickExitLinkDocumentedProps>({
  href: {
    type: 'string',
    description:
      'Where the person goes: an https:// or http:// address, or a path on your own site such as /api/quick-exit. Anything else renders the link without an address, warns once in development and goes nowhere.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message quickExit.label',
    description:
      'Your own label. It replaces the message, so write it in the provider’s language. Keep the visible text and the name the same.',
  },
  as: {
    type: 'ElementType',
    default: "'a'",
    description:
      'Changes the element to a component of your own, only where you need a router link. It must render an <a href> and forward its ref, and it gets the other props, the ref and the part’s class.',
  },
})

export type QuickExitHintDocumentedProps = Pick<QuickExitHintProps, 'children'>

export const quickExitHintRows = propRows<QuickExitHintDocumentedProps>({
  children: {
    type: 'ReactNode',
    default: 'the message quickExit.hint',
    description:
      'Your own sentence. Keep it short: more than 3 lines below 40rem, or 2 lines at 40rem and wider, makes the row taller than the scroll padding the theme sets for the sticky row, so a focused element can end up under it (2.4.11).',
  },
})

export const quickExitRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-quick-exit',
    values: 'always',
    meaning:
      'The part class. The default theme draws the row: sticky at the top when the window is tall enough, static when it is short.',
  },
  {
    name: 'data-state',
    values: '"idle", "armed" or "leaving"',
    meaning:
      'armed: one or two Shift presses are counted. leaving: the page is hidden and navigate has been called.',
  },
]

export const quickExitLinkAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-quick-exit-link',
    values: 'always',
    meaning: 'The part class. The default theme gives the link its own filled look.',
  },
  {
    name: 'aria-describedby',
    values: 'the id of the Hint',
    meaning:
      'Set on the link only while a QuickExit.Hint is mounted, so a screen reader reads the hint after the name.',
  },
  {
    name: 'rel',
    values: '"noreferrer"',
    meaning:
      'Asks the browser to send no referrer (the address of the page the person came from) when it follows the link itself, for example with JavaScript off.',
  },
  {
    name: 'referrerpolicy',
    values: '"no-referrer"',
    meaning:
      'The same request, as a policy on the link. Both only apply when the browser follows the link itself.',
  },
]

export const quickExitHintAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-quick-exit-hint',
    values: 'always',
    meaning: 'The part class. The default theme draws the sentence next to the link.',
  },
]

export const useQuickExitHook: ApiHook = {
  name: 'useQuickExit',
  intro:
    'Gives the behaviour to your own <div> and <a href>: the key listener, the announcement and the exit.',
  options: propRows<UseQuickExitOptions>({
    href: {
      type: 'string | undefined',
      description:
        'Where the person goes: an https:// or http:// address, or a path on your own site. Anything else warns in development and goes nowhere.',
    },
    shortcut: shortcutRow,
    navigate: navigateRow,
    windowMs: windowMsRow,
    messages: messagesRow,
  }),
  result: propRows<UseQuickExitResult>({
    rootProps: {
      type: 'QuickExitRootPartProps',
      default: '–',
      description: 'Spread on the row element: the class and data-state.',
    },
    linkProps: {
      type: 'QuickExitLinkPartProps',
      default: '–',
      description:
        'Spread on an <a>: the class, href, rel, referrerpolicy and the click handlers that leave the page.',
    },
    hintProps: {
      type: 'QuickExitHintPartProps',
      default: '–',
      description:
        'Spread on a <p>: the class. Also give the link aria-describedby with the id of this <p>.',
    },
    hint: {
      type: 'string',
      default: '–',
      description:
        'The message quickExit.hint: the sentence to show next to the link while the shortcut is on.',
    },
    label: {
      type: 'string',
      default: '–',
      description: 'The message quickExit.label: the default text of the link.',
    },
    state: {
      type: "'idle' | 'armed' | 'leaving'",
      default: '–',
      description: 'The same value as data-state, for your own markup.',
    },
  }),
}
