import type { Metadata } from 'next'
import { ReadAloudPage } from '../../../components/read-aloud-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'ReadAloud' }) }

export default function Page() {
  return (
    <ReadAloudPage
      contract={readContract('read-aloud')}
      sources={{
        default: readExampleSource('read-aloud/default.tsx'),
        minimal: readExampleSource('read-aloud/minimal.tsx'),
        'swedish-content': readExampleSource('read-aloud/swedish-content.tsx'),
      }}
    />
  )
}
