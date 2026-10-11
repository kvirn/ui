import type { Metadata } from 'next'
import { DefinitionListPage } from '../../../components/definition-list-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'DefinitionList' }) }

export default function Page() {
  return (
    <DefinitionListPage
      contract={readContract('definition-list')}
      sources={{
        default: readExampleSource('definition-list/default.tsx'),
        'check-your-answers': readExampleSource('definition-list/check-your-answers.tsx'),
        'case-card': readExampleSource('definition-list/case-card.tsx'),
        'missing-answer': readExampleSource('definition-list/missing-answer.tsx'),
        'several-answers': readExampleSource('definition-list/several-answers.tsx'),
        'own-markup': readExampleSource('definition-list/own-markup.tsx'),
      }}
    />
  )
}
