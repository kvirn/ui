import type { Metadata } from 'next'
import { SummaryListPage } from '../../../components/summary-list-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'SummaryList' }) }

export default function Page() {
  return (
    <SummaryListPage
      contract={readContract('summary-list')}
      sources={{
        default: readExampleSource('summary-list/default.tsx'),
        'check-your-answers': readExampleSource('summary-list/check-your-answers.tsx'),
        'case-card': readExampleSource('summary-list/case-card.tsx'),
        'missing-answer': readExampleSource('summary-list/missing-answer.tsx'),
        'several-answers': readExampleSource('summary-list/several-answers.tsx'),
        'own-markup': readExampleSource('summary-list/own-markup.tsx'),
      }}
    />
  )
}
