import type { SkipLinkProps, UseSkipLinkOptions, UseSkipLinkResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type SkipLinkDocumentedProps = Pick<SkipLinkProps, 'href' | 'children' | 'messages' | 'as'>

export const skipLinkRows = propRows<SkipLinkDocumentedProps>({
  href: {
    type: 'string',
    description:
      'A same-page address, "#main": the id of the main content. A development warning says so when no element has the id.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message skipLink.label',
    description: 'Your own label. It replaces the message, so write it in the provider’s language.',
  },
  messages: {
    type: "Partial<KvirnMessages['skipLink']>",
    default: '–',
    description: 'Overrides the message for this link: { label: "Hoppa till innehållet" }.',
  },
  as: {
    type: 'ElementType',
    default: "'a'",
    description:
      'Changes the element to a component of your own, such as your design system’s link. It must render an <a href> and forward its ref, and it gets the other props, the ref and the part’s class. Don’t use Link.Root: a same-page address is not a route.',
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
