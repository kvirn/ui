import type { UseRouteFocusOptions } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'

export const useRouteFocusRows = propRows<UseRouteFocusOptions>({
  key: {
    type: 'string',
    description:
      'The router’s location as a string: the pathname plus the search, never the hash. Focus moves when it changes.',
  },
  containerRef: {
    type: 'RefObject<Element | null>',
    default: 'the document',
    description: 'Where to look for the selector: the element that holds the page.',
  },
  selector: {
    type: 'string',
    default: "'h1'",
    description: 'The element to focus. It gets tabindex="-1" for as long as it has focus.',
  },
  announce: {
    type: 'boolean',
    default: 'false',
    description:
      'Also says “Navigated to {title}” in the shared live region. Leave it off where the router already announces routes.',
  },
  messages: {
    type: "Partial<KvirnMessages['routeFocus']>",
    default: '–',
    description: 'Overrides the message routeFocus.navigated for this call.',
  },
})
