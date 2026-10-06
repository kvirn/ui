import type { Metadata } from 'next'
import { AlertPage } from '../../../components/alert-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Alert' }) }

export default function Page() {
  return (
    <AlertPage
      contract={readContract('alert')}
      sources={{
        default: readExampleSource('alert/default.tsx'),
        statuses: readExampleSource('alert/statuses.tsx'),
        'with-actions': readExampleSource('alert/with-actions.tsx'),
        announced: readExampleSource('alert/announced.tsx'),
        dismissible: readExampleSource('alert/dismissible.tsx'),
      }}
    />
  )
}
