import type {
  ErrorSummaryItemProps,
  ErrorSummaryLinkProps,
  ErrorSummaryListProps,
  ErrorSummaryRootProps,
  ErrorSummaryTitleProps,
  UseErrorSummaryOptions,
  UseErrorSummaryResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const refRow = {
  type: 'Ref<HTMLElement>',
  default: '–',
  description: 'Reaches the element, whichever it is.',
}

const messagesRow = {
  type: "Partial<KvirnMessages['errorSummary']>",
  default: '–',
  description:
    'Per-instance override of the title and of the page title prefix, such as { title: "Rätta felen" }.',
}

export const rootRows = propRows<
  Pick<ErrorSummaryRootProps, 'focusKey' | 'prefixDocumentTitle' | 'messages' | 'ref'>
>({
  focusKey: {
    type: 'string | number',
    default: '–',
    description:
      'Moves focus to the summary on mount and each time it changes. Pass the submit count, so a second failed submit moves focus again. Without it, focus moves once, on mount.',
  },
  prefixDocumentTitle: {
    type: 'boolean',
    default: 'false',
    description:
      'Puts the text errorSummary.titlePrefix (“Error:”) before document.title while the summary is shown, and restores the title when it is removed. Leave it off if your router owns the title.',
  },
  messages: messagesRow,
  ref: refRow,
})

export const titleRows = propRows<Pick<ErrorSummaryTitleProps, 'as' | 'ref'>>({
  as: {
    type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    default: "'h2'",
    description:
      'Sets the heading level, for example as="h3". The status word stays. There is no h1 and no p: the summary needs a heading for the group’s name. Children replace the default text.',
  },
  ref: refRow,
})

export const listRows = propRows<Pick<ErrorSummaryListProps, 'as' | 'ref'>>({
  as: {
    type: "'ul' | 'ol'",
    default: "'ul'",
    description: 'A list of problems, optionally numbered.',
  },
  ref: refRow,
})

export const itemRows = propRows<Pick<ErrorSummaryItemProps, 'ref'>>({
  ref: refRow,
})

export const linkRows = propRows<Pick<ErrorSummaryLinkProps, 'controlId' | 'ref'>>({
  controlId: {
    type: 'string',
    description:
      'The id of the control the error is about, or of a group’s first option. Sets href to “#” plus the id. Set the id with controlId on Field.Root.',
  },
  ref: {
    type: 'Ref<HTMLAnchorElement>',
    default: '–',
    description: 'Reaches the link.',
  },
})

export const rootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-error-summary',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-alert, kv-alert--danger',
    values: 'always',
    meaning: 'From Alert.Danger: the danger colour, icon and status word.',
  },
  { name: 'role', values: 'group', meaning: 'A named group, not an alert and not a landmark.' },
  {
    name: 'tabindex',
    values: '-1',
    meaning: 'Focusable by script, so it takes focus; not a Tab stop.',
  },
  { name: 'aria-labelledby', values: 'the Title’s id', meaning: 'Names the group.' },
]

export const titleAttributes: readonly AttributeRow[] = [
  { name: 'kv-alert-title', values: 'always', meaning: 'From Alert.Title.' },
  { name: 'kv-alert-status', values: 'always', meaning: 'The status word that starts the Title.' },
  { name: 'id', values: 'generated', meaning: 'Names the group.' },
]

export const listAttributes: readonly AttributeRow[] = [
  { name: 'kv-error-summary-list', values: 'always', meaning: 'The part class.' },
  {
    name: 'role',
    values: 'list',
    meaning: 'Explicit, because the theme draws no markers and Safari then drops the list.',
  },
]

export const itemAttributes: readonly AttributeRow[] = [
  { name: 'kv-error-summary-item', values: 'always', meaning: 'The part class.' },
]

export const linkAttributes: readonly AttributeRow[] = [
  { name: 'kv-link', values: 'always', meaning: 'The Link class.' },
  { name: 'kv-error-summary-link', values: 'always', meaning: 'The part class.' },
]

export const useErrorSummaryHook: ApiHook = {
  name: 'useErrorSummary',
  options: propRows<UseErrorSummaryOptions>({
    focusKey: {
      type: 'string | number',
      default: '–',
      description:
        'Moves focus to the summary on mount and each time it changes. Pass the submit count.',
    },
    prefixDocumentTitle: {
      type: 'boolean',
      default: 'false',
      description:
        'Puts errorSummary.titlePrefix before document.title while the summary is shown.',
    },
    messages: messagesRow,
  }),
  result: propRows<UseErrorSummaryResult>({
    rootProps: {
      type: 'ErrorSummaryRootPartProps',
      default: '–',
      description:
        'Spread on the summary’s element, usually an Alert.Danger: class, role group, tabIndex -1, aria-labelledby and a callback ref that moves focus.',
    },
    titleProps: {
      type: 'ErrorSummaryTitlePartProps',
      default: '–',
      description: 'Spread on the heading. The id names the group.',
    },
    listProps: {
      type: 'ErrorSummaryListPartProps',
      default: '–',
      description: 'Spread on the <ul>: class and role list.',
    },
    itemProps: {
      type: 'ErrorSummaryItemPartProps',
      default: '–',
      description: 'Spread on an <li>.',
    },
    getLinkProps: {
      type: '(controlId: string) => ErrorSummaryLinkPartProps',
      default: '–',
      description:
        'Spread on an <a>: class, href and the click handler that focuses the control and scrolls its label into view. A modified click and a missing control are left to the browser.',
    },
    title: {
      type: 'string',
      default: '–',
      description: 'The text errorSummary.title: the default text of the heading.',
    },
  }),
}
