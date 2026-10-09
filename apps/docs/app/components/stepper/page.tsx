import type { Metadata } from 'next'
import { StepperPage } from '../../../components/stepper-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Stepper' }) }

export default function Page() {
  return (
    <StepperPage
      contract={readContract('stepper')}
      sources={{
        default: readExampleSource('stepper/default.tsx'),
        'without-name': readExampleSource('stepper/without-name.tsx'),
        'own-markup': readExampleSource('stepper/own-markup.tsx'),
      }}
    />
  )
}
