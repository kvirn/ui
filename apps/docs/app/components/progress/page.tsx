import type { Metadata } from 'next'
import { ProgressPage } from '../../../components/progress-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Progress' }) }

export default function Page() {
  return (
    <ProgressPage
      contract={readContract('progress')}
      sources={{
        default: readExampleSource('progress/default.tsx'),
        'busy-button': readExampleSource('progress/busy-button.tsx'),
        'known-value': readExampleSource('progress/known-value.tsx'),
        'slow-wait': readExampleSource('progress/slow-wait.tsx'),
        'own-markup': readExampleSource('progress/own-markup.tsx'),
      }}
    />
  )
}
