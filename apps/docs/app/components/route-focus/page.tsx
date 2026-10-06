import type { Metadata } from 'next'
import { RouteFocusPage } from '../../../components/route-focus-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Route focus' }) }

export default function Page() {
  return (
    <RouteFocusPage
      contract={readContract('route-focus')}
      sources={{
        default: readExampleSource('route-focus/default.tsx'),
        'hash-change': readExampleSource('route-focus/hash-change.tsx'),
      }}
    />
  )
}
