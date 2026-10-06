import type { Metadata } from 'next'
import { DisclosurePage } from '../../../components/disclosure-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Disclosure' }) }

export default function Page() {
  return (
    <DisclosurePage
      contract={readContract('disclosure')}
      sources={{
        default: readExampleSource('disclosure/default.tsx'),
        'show-more': readExampleSource('disclosure/show-more.tsx'),
        'find-in-page': readExampleSource('disclosure/find-in-page.tsx'),
        controlled: readExampleSource('disclosure/controlled.tsx'),
      }}
    />
  )
}
