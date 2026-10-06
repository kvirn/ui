import type { Metadata } from 'next'
import { PaginationPage } from '../../../components/pagination-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Pagination' }) }

export default function Page() {
  return (
    <PaginationPage
      contract={readContract('pagination')}
      sources={{
        default: readExampleSource('pagination/default.tsx'),
        'news-list': readExampleSource('pagination/news-list.tsx'),
        'first-page': readExampleSource('pagination/first-page.tsx'),
        'own-words': readExampleSource('pagination/own-words.tsx'),
      }}
    />
  )
}
