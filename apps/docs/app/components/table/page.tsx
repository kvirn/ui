import type { Metadata } from 'next'
import { TablePage } from '../../../components/table-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Table' }) }

export default function Page() {
  return (
    <TablePage
      contract={readContract('table')}
      sources={{
        default: readExampleSource('table/default.tsx'),
        sortable: readExampleSource('table/sortable.tsx'),
        selectable: readExampleSource('table/selectable.tsx'),
        expandable: readExampleSource('table/expandable.tsx'),
        empty: readExampleSource('table/empty.tsx'),
        large: readExampleSource('table/large.tsx'),
      }}
    />
  )
}
