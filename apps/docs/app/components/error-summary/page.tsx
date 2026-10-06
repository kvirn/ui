import type { Metadata } from 'next'
import { ErrorSummaryPage } from '../../../components/error-summary-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'ErrorSummary' }) }

export default function Page() {
  return (
    <ErrorSummaryPage
      contract={readContract('error-summary')}
      sources={{
        default: readExampleSource('error-summary/default.tsx'),
        'failed-submit': readExampleSource('error-summary/failed-submit.tsx'),
        'group-error': readExampleSource('error-summary/group-error.tsx'),
        'page-title': readExampleSource('error-summary/page-title.tsx'),
      }}
    />
  )
}
