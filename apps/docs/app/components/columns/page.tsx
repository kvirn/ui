import type { Metadata } from 'next'
import { ColumnsPage } from '../../../components/columns-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Columns' }) }

export default function Page() {
  return (
    <ColumnsPage
      contract={readContract('columns')}
      sources={{
        default: readExampleSource('columns/default.tsx'),
        'service-list': readExampleSource('columns/service-list.tsx'),
        'quick-links': readExampleSource('columns/quick-links.tsx'),
        news: readExampleSource('columns/news.tsx'),
      }}
    />
  )
}
