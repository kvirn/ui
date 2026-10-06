import type { Metadata } from 'next'
import { LinkPage } from '../../../components/link-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Link' }) }

export default function Page() {
  return (
    <LinkPage
      contract={readContract('link')}
      sources={{
        default: readExampleSource('link/default.tsx'),
        'new-tab': readExampleSource('link/new-tab.tsx'),
        'current-page': readExampleSource('link/current-page.tsx'),
        'other-language': readExampleSource('link/other-language.tsx'),
        'service-link': readExampleSource('link/service-link.tsx'),
      }}
    />
  )
}
