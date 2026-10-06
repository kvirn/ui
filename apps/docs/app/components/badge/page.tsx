import type { Metadata } from 'next'
import { BadgePage } from '../../../components/badge-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Badge' }) }

export default function Page() {
  return (
    <BadgePage
      contract={readContract('badge')}
      sources={{
        default: readExampleSource('badge/default.tsx'),
        'status-in-list': readExampleSource('badge/status-in-list.tsx'),
        'with-context': readExampleSource('badge/with-context.tsx'),
      }}
    />
  )
}
