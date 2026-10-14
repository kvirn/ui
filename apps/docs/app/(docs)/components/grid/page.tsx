import type { Metadata } from 'next'
import { GridPage } from '../../../../components/grid-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Grid' }) }

export default function Page() {
  return (
    <GridPage
      contract={readContract('grid')}
      sources={{
        default: readExampleSource('grid/default.tsx'),
        'page-layout': readExampleSource('grid/page-layout.tsx'),
        'service-page': readExampleSource('grid/service-page.tsx'),
        'side-information': readExampleSource('grid/side-information.tsx'),
        'quick-links': readExampleSource('grid/quick-links.tsx'),
      }}
    />
  )
}
