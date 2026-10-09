import type { SkipLinkProps, UseSkipLinkOptions, UseSkipLinkResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type SkipLinkDocumentedProps = Pick<SkipLinkProps, 'href' | 'children' | 'messages'>

export const skipLinkRows = propRows<SkipLinkDocumentedProps>({
  href: {
    type: 'string',
    description:
      'A same-page address, "#main": the id of the main content. A development warning says so when no element has the id.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message skipLink.label',
    description:
      'Your own label. It replaces the message, so its language is yours to set with lang.',
  },
  messages: {
    type: "Partial<KvirnMessages['skipLink']>",
    default: '–',
    description: 'Overrides the message for this link: { label: "Hoppa till innehållet" }.',
  },
})

export const skipLinkAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-skip-link',
    values: 'always',
    meaning: 'The part class. The default theme hides the link until it has focus.',
  },
]

export const useSkipLinkHook: ApiHook = {
  name: 'useSkipLink',
  options: propRows<UseSkipLinkOptions>({
    href: {
      type: 'string',
      description: 'A same-page address, "#main": the id of the element the link jumps to.',
    },
    messages: {
      type: "Partial<KvirnMessages['skipLink']>",
      default: '–',
      description: 'Overrides the message skipLink.label for this link.',
    },
  }),
  result: propRows<UseSkipLinkResult>({
    skipLinkProps: {
      type: 'SkipLinkPartProps',
      default: '–',
      description:
        'Spread on an <a>: class, href and a click handler that moves focus to the target.',
    },
    label: {
      type: 'string',
      default: '–',
      description: 'The message skipLink.label: the default text of the link.',
    },
  }),
}
