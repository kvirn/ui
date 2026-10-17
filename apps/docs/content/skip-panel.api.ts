import type {
  SkipPanelLabelProps,
  SkipPanelLinkProps,
  SkipPanelRootComponentProps,
  SkipPanelShortcutProps,
  UseSkipPanelOptions,
  UseSkipPanelResult,
  useSkipPanelGroup,
  useSkipPanelHint,
  useSkipPanelLink,
  useSkipPanelShortcut,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const chordType = '{ key: string; alt?: boolean; shift?: boolean; ctrl?: boolean; meta?: boolean }'

type UseSkipPanelLinkOptions = Parameters<typeof useSkipPanelLink>[0]
type UseSkipPanelShortcutOptions = Parameters<typeof useSkipPanelShortcut>[0]
type UseSkipPanelShortcutResult = ReturnType<typeof useSkipPanelShortcut>

export type SkipPanelRootDocumentedProps = Pick<
  SkipPanelRootComponentProps,
  'reopenShortcut' | 'shortcutsEnabled'
>

export const skipPanelRootRows = propRows<SkipPanelRootDocumentedProps>({
  reopenShortcut: {
    type: chordType,
    default: '–',
    description:
      'A chord that opens the list again from anywhere on the page, such as { key: "k", alt: true, shift: true }. It focuses the first link. There is no default chord. Add a Hint to tell people which keys it is.',
  },
  shortcutsEnabled: {
    type: 'boolean',
    default: 'true',
    description:
      'false adds no keyboard listener, so no chord works, including reopenShortcut. It removes the key names from the rows and the aria-keyshortcuts attribute, and the Hint is not rendered. The rows stay in the list as links and buttons.',
  },
})

export const skipPanelRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-skip-panel',
    values: 'always',
    meaning: 'The part class. The default theme hides the list until it has focus.',
  },
  {
    name: 'data-collapsed',
    values: 'present or absent',
    meaning:
      'Set after Escape on the list when someone reached it with Tab. Only the focused item stays visible. It clears when focus leaves the list.',
  },
  {
    name: 'data-reopened',
    values: 'present or absent',
    meaning: 'Set while the list is open because of reopenShortcut. Escape clears it.',
  },
]

export type SkipPanelLabelDocumentedProps = Pick<
  SkipPanelLabelProps,
  'kind' | 'children' | 'messages'
>

export const skipPanelLabelRows = propRows<SkipPanelLabelDocumentedProps>({
  kind: {
    type: '"skip" | "shortcuts"',
    default: '"skip"',
    description:
      'Picks the default text. skip gives skipPanel.skipToLabel. shortcuts gives skipPanel.shortcutsLabel, or skipPanel.actionsLabel while shortcutsEnabled is false.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message for kind',
    description:
      'Your own text. It replaces the message, so you set its language: mark it if it differs from the page.',
  },
  messages: {
    type: "Partial<KvirnMessages['skipPanel']>",
    default: '–',
    description: 'Overrides the messages for this label: { skipToLabel: "Go to" }.',
  },
})

export type SkipPanelLinkDocumentedProps = Pick<
  SkipPanelLinkProps,
  'href' | 'children' | 'messages' | 'as'
>

export const skipPanelLinkRows = propRows<SkipPanelLinkDocumentedProps>({
  href: {
    type: 'string',
    description:
      'A same-page address, "#main": the id of the element the link jumps to. A development warning says so when no element has the id.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message skipPanel.mainContent',
    description:
      'Your own text. It replaces the message, so you set its language: mark it if it differs from the page.',
  },
  messages: {
    type: "Partial<KvirnMessages['skipPanel']>",
    default: '–',
    description: 'Overrides the message for this link: { mainContent: "The content" }.',
  },
  as: {
    type: 'ElementType',
    default: "'a'",
    description:
      'Changes the element to a component of your own, such as your design system’s link. It must render an <a href> and forward its ref. Don’t use Link.Root: a same-page address is not a route.',
  },
})

export const skipPanelLinkAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-skip-panel__link',
    values: 'always',
    meaning: 'The part class.',
  },
]

export type SkipPanelShortcutDocumentedProps = Pick<
  SkipPanelShortcutProps,
  'shortcut' | 'children' | 'as'
>

export const skipPanelShortcutRows = propRows<SkipPanelShortcutDocumentedProps>({
  shortcut: {
    type: chordType,
    description:
      'The chord, such as { key: "s", alt: true, shift: true } for Alt+Shift+S. Pressing it anywhere on the page, except in a text field, runs this row (it clicks the button or the link). Use Alt or Option with Shift and a letter. Never a bare letter, and never Ctrl with Alt. A development warning flags both.',
  },
  children: {
    type: 'ReactNode',
    default: '–',
    description:
      'The row’s text, such as "Search". The key names follow it. A screen reader reads the text and then the keys.',
  },
  as: {
    type: 'ElementType',
    default: "'button'",
    description:
      'Makes the row a link, with "a" or your router’s link component. It must render an <a href> or a button and forward its ref. Without it the row is a <button type="button"> and you set onClick.',
  },
})

export const skipPanelShortcutAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-skip-panel__shortcut',
    values: 'always',
    meaning: 'The part class.',
  },
  {
    name: 'aria-keyshortcuts',
    values: '"Alt+Shift+S"',
    meaning:
      'The chord in the form the ARIA specification uses. It is removed while shortcutsEnabled is false.',
  },
]

export const useSkipPanelHook: ApiHook = {
  name: 'useSkipPanel',
  intro:
    'The Root’s behaviour: the reopen and Escape state, and one keyboard listener on the document that exists only while shortcutsEnabled. It also makes the panel one Tab stop with the arrow, Home and End keys.',
  options: propRows<UseSkipPanelOptions>({
    reopenShortcut: {
      type: chordType,
      default: '–',
      description: 'A chord that opens the list again and focuses the first link. No default.',
    },
    shortcutsEnabled: {
      type: 'boolean',
      default: 'true',
      description:
        'false adds no listener and drops the key names and aria-keyshortcuts from the parts.',
    },
  }),
  result: propRows<UseSkipPanelResult>({
    rootProps: {
      type: 'SkipPanelPartProps',
      default: '–',
      description:
        'Spread on a <div>: the class, data-collapsed, data-reopened and the Escape, focus and mouse handlers.',
    },
    listProps: {
      type: '{ className, role: "list" }',
      default: '–',
      description: 'Spread on a <ul>.',
    },
    itemProps: {
      type: '{ className }',
      default: '–',
      description: 'Spread on a <li>.',
    },
    hintProps: {
      type: '{ className }',
      default: '–',
      description: 'Spread on the <p> of your own hint.',
    },
    rootRef: {
      type: 'RefObject<HTMLElement | null>',
      default: '–',
      description: 'Set on the Root’s element. The reopen chord looks for the first link in it.',
    },
    context: {
      type: 'SkipPanelContextValue',
      default: '–',
      description: 'What the parts share. SkipPanel.Root provides it; the part hooks read it.',
    },
    collapsed: {
      type: 'boolean',
      default: '–',
      description: 'true after Escape on the list reached with Tab.',
    },
    reopened: {
      type: 'boolean',
      default: '–',
      description: 'true while the list is open because of reopenShortcut.',
    },
  }),
}

export const useSkipPanelGroupHook: ApiHook = {
  name: 'useSkipPanelGroup',
  intro: 'It takes no options.',
  result: propRows<ReturnType<typeof useSkipPanelGroup>>({
    groupProps: {
      type: '{ className, role: "group", aria-labelledby }',
      default: '–',
      description: 'Spread on the group’s <div>. It points at the label.',
    },
    labelProps: {
      type: '{ className, id }',
      default: '–',
      description: 'Spread on the label’s <span>, so the group is named by its visible text.',
    },
  }),
}

export const useSkipPanelLinkHook: ApiHook = {
  name: 'useSkipPanelLink',
  options: propRows<UseSkipPanelLinkOptions>({
    href: {
      type: 'string',
      description: 'A same-page address, "#main": the id of the element the link jumps to.',
    },
    messages: {
      type: "Partial<KvirnMessages['skipPanel']>",
      default: '–',
      description: 'Overrides the message skipPanel.mainContent for this link.',
    },
  }),
  result: propRows<ReturnType<typeof useSkipPanelLink>>({
    linkProps: {
      type: '{ className, href, onClick }',
      default: '–',
      description:
        'Spread on an <a>. The click handler moves focus to the target, as SkipLink does.',
    },
    label: {
      type: 'string',
      default: '–',
      description: 'The message skipPanel.mainContent: the default text of the link.',
    },
  }),
}

export const useSkipPanelShortcutHook: ApiHook = {
  name: 'useSkipPanelShortcut',
  intro: 'It registers the chord with the Root while shortcutsEnabled, and gives the key names.',
  options: propRows<UseSkipPanelShortcutOptions>({
    shortcut: {
      type: chordType,
      description: 'The chord.',
    },
    elementRef: {
      type: 'RefObject<HTMLElement | null>',
      description: 'The element the chord clicks. Set it on your row.',
    },
  }),
  result: propRows<UseSkipPanelShortcutResult>({
    shortcutProps: {
      type: '{ className, aria-keyshortcuts? }',
      default: '–',
      description: 'Spread on your row. aria-keyshortcuts is left out while shortcuts are off.',
    },
    keys: {
      type: '{ key, text }[]',
      default: '–',
      description:
        'The key names in order, such as Alt, Shift, S. Option replaces Alt on Apple platforms. Empty while shortcuts are off.',
    },
    joiner: {
      type: 'string',
      default: '–',
      description: 'The message keys.joiner, which goes between the key names.',
    },
  }),
}

export const useSkipPanelHintHook: ApiHook = {
  name: 'useSkipPanelHint',
  intro:
    'It takes no options. Calling it tells the Root that a Hint exists, so the first link is described by it.',
  result: propRows<ReturnType<typeof useSkipPanelHint>>({
    hintProps: {
      type: '{ className }',
      default: '–',
      description: 'Spread on a <p>.',
    },
    arrowHint: {
      type: '{ id, text }',
      default: '–',
      description:
        'The arrow-key sentence, always shown, and the id that the first link’s aria-describedby points at. Render the text in an element with that id.',
    },
    sentence: {
      type: '{ before, after } | undefined',
      default: '–',
      description:
        'The text around the reopen keys: before and after. It is undefined, so add nothing after the arrow sentence, when there is no reopenShortcut or shortcuts are off.',
    },
    keys: {
      type: '{ key, text }[]',
      default: '–',
      description: 'The reopen chord’s key names in order.',
    },
    joiner: {
      type: 'string',
      default: '–',
      description: 'The message keys.joiner, which goes between the key names.',
    },
  }),
}
