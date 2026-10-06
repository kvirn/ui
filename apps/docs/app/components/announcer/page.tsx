import type { Metadata } from 'next'
import { AnnouncerPage } from '../../../components/announcer-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Announcer' }) }

export default function Page() {
  return (
    <AnnouncerPage
      contract={readContract('announcer')}
      sources={{
        default: readExampleSource('announcer/default.tsx'),
        assertive: readExampleSource('announcer/assertive.tsx'),
        throttled: readExampleSource('announcer/throttled.tsx'),
      }}
    />
  )
}
