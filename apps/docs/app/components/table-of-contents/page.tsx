import type { Metadata } from 'next'
import { TableOfContentsPage } from '../../../components/table-of-contents-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'TableOfContents' }) }

export default function Page() {
  return (
    <TableOfContentsPage
      contract={readContract('table-of-contents')}
      sources={{
        default: readExampleSource('table-of-contents/default.tsx'),
        'two-levels': readExampleSource('table-of-contents/two-levels.tsx'),
        'own-markup': readExampleSource('table-of-contents/own-markup.tsx'),
        'no-visible-title': readExampleSource('table-of-contents/no-visible-title.tsx'),
      }}
    />
  )
}
