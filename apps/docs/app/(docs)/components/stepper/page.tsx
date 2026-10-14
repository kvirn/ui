import type { Metadata } from 'next'
import { StepperPage } from '../../../../components/stepper-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Stepper' }) }

export default function Page() {
  return (
    <StepperPage
      contract={readContract('stepper')}
      sources={{
        default: readExampleSource('stepper/default.tsx'),
        'question-page': readExampleSource('stepper/question-page.tsx'),
        'application-flow': readExampleSource('stepper/application-flow.tsx'),
        'options-page': readExampleSource('stepper/options-page.tsx'),
        'own-markup': readExampleSource('stepper/own-markup.tsx'),
      }}
    />
  )
}
