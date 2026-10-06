import type { Metadata } from 'next'
import { AccordionPage } from '../../../components/accordion-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Accordion' }) }

export default function Page() {
  return (
    <AccordionPage
      contract={readContract('accordion')}
      sources={{
        default: readExampleSource('accordion/default.tsx'),
        'open-by-default': readExampleSource('accordion/open-by-default.tsx'),
        'find-in-page': readExampleSource('accordion/find-in-page.tsx'),
        regions: readExampleSource('accordion/regions.tsx'),
        'as-a-list': readExampleSource('accordion/as-a-list.tsx'),
      }}
    />
  )
}
