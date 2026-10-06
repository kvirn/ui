import type { Metadata } from 'next'
import { TogglePage } from '../../../components/toggle-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Toggle' }) }

export default function Page() {
  return (
    <TogglePage
      contract={readContract('toggle')}
      sources={{
        default: readExampleSource('toggle/default.tsx'),
        'filter-list': readExampleSource('toggle/filter-list.tsx'),
        'icon-only': readExampleSource('toggle/icon-only.tsx'),
        'disabled-with-reason': readExampleSource('toggle/disabled-with-reason.tsx'),
      }}
    />
  )
}
