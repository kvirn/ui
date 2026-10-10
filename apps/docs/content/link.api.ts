import type {
  LinkIconProps,
  LinkNewTabNoticeProps,
  LinkProps,
  UseLinkOptions,
  UseLinkResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props Link documents: its own, and the two native ones whose behaviour it changes. */
export type LinkDocumentedProps = Pick<LinkProps, 'current' | 'target' | 'rel' | 'messages' | 'as'>

export const linkRows = propRows<LinkDocumentedProps>({
  current: {
    type: "'page' | 'step' | 'location' | 'date' | 'time' | boolean",
    default: '–',
    description:
      'Marks the link as the current item in a set, as aria-current. Link does not detect it from the router. false or absent sets nothing.',
  },
  target: {
    type: 'string',
    default: '–',
    description:
      'Passed to the element. "_blank" opens a new tab and adds rel="noopener noreferrer" to your own rel tokens.',
  },
  rel: {
    type: 'string',
    default: '–',
    description: 'Your own rel tokens, kept. A new-tab link gets noopener noreferrer added once.',
  },
  messages: {
    type: "Partial<KvirnMessages['link']>",
    default: '–',
    description: 'Overrides link.newTabNotice for this link and its Link.NewTabNotice.',
  },
  as: {
    type: 'ElementType',
    default: 'the registered router link, or <a>',
    description:
      'Changes the element to a component of your own, with its props set on the Link. Link.Root as="a" bypasses the registered router link. It must render an <a href> and forward its ref.',
  },
})

export const linkAttributes: readonly AttributeRow[] = [
  { name: 'kv-link', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'kv-link--service',
    values: 'class you add',
    meaning:
      'The one link that starts an e-service: an outlined label with the icon in a block. A look, not a role. Theme variant.',
  },
  {
    name: 'aria-current',
    values: '"page", "step", "location", "date", "time" or "true"',
    meaning: 'From current. Not passed directly.',
  },
  { name: 'data-current', values: 'present or absent', meaning: 'The link has current set.' },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The link has keyboard focus (:focus-visible).',
  },
]

export const linkNewTabNoticeRows = propRows<Pick<LinkNewTabNoticeProps, 'children' | 'as'>>({
  children: {
    type: 'ReactNode',
    default: '–',
    description:
      'Your own text. It wins over every message. Empty text falls through to the message.',
  },
  as: {
    type: "'span' | 'em' | 'small'",
    default: "'span'",
    description: 'Changes the element. Another tag warns once in development.',
  },
})

export const linkNewTabNoticeAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-link-new-tab-notice',
    values: 'always',
    meaning: 'The part class. Your own class joins it.',
  },
]

export const linkIconRows = propRows<Pick<LinkIconProps, 'children' | 'as'>>({
  children: {
    type: 'ReactNode',
    default: '–',
    description:
      'The icon, for example <Icon name="arrow-forward" size="24" />, or any decorative SVG.',
  },
  as: {
    type: "'span' | 'i'",
    default: "'span'",
    description: 'Changes the element. It stays decorative: aria-hidden and the class are kept.',
  },
})

export const linkIconAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-link-icon',
    values: 'always',
    meaning: 'The part class. Your own class joins it.',
  },
  {
    name: 'aria-hidden',
    values: '"true"',
    meaning: 'Always set, and it cannot be turned off, so the icon is never part of the name.',
  },
]

export const useLinkHook: ApiHook = {
  name: 'useLink',
  options: propRows<UseLinkOptions>({
    current: {
      type: "'page' | 'step' | 'location' | 'date' | 'time' | boolean",
      default: '–',
      description: 'Sets aria-current and data-current. false or absent sets nothing.',
    },
    target: {
      type: 'string',
      default: '–',
      description: 'Mirrors HTML target. "_blank" adds rel="noopener noreferrer".',
    },
    rel: { type: 'string', default: '–', description: 'Your own rel tokens, kept.' },
    messages: {
      type: "Partial<KvirnMessages['link']>",
      default: '–',
      description: 'Per-instance message overrides.',
    },
  }),
  result: propRows<UseLinkResult>({
    linkProps: {
      type: 'LinkPartProps',
      default: '–',
      description:
        'Spread on an <a href> or your router link: class, target, rel, aria-current, focus handlers.',
    },
    isCurrent: { type: 'boolean', default: '–', description: 'Whether current is set.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the link has keyboard (:focus-visible) focus.',
    },
    opensInNewTab: {
      type: 'boolean',
      default: '–',
      description: 'True for target="_blank": render newTabNotice inside the link.',
    },
    newTabNotice: {
      type: 'string',
      default: '–',
      description: 'The resolved link.newTabNotice text, for example (opens in a new tab).',
    },
  }),
}
