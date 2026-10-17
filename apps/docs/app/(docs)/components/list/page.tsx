import type { Metadata } from 'next'
import { ListPage } from '../../../../components/list-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'List' }) }

export default function Page() {
  return (
    <ListPage
      contract={readContract('list')}
      sources={{
        default: readExampleSource('list/default.tsx'),
        'related-links': readExampleSource('list/related-links.tsx'),
        steps: readExampleSource('list/steps.tsx'),
        nested: readExampleSource('list/nested.tsx'),
      }}
    />
  )
}
