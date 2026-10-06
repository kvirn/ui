import type { Metadata } from 'next'
import { SkipLinkPage } from '../../../components/skip-link-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'SkipLink' }) }

export default function Page() {
  return (
    <SkipLinkPage
      contract={readContract('skip-link')}
      sources={{
        default: readExampleSource('skip-link/default.tsx'),
        'custom-label': readExampleSource('skip-link/custom-label.tsx'),
        'own-element': readExampleSource('skip-link/own-element.tsx'),
      }}
    />
  )
}
