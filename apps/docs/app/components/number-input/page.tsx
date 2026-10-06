import type { Metadata } from 'next'
import { NumberInputPage } from '../../../components/number-input-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'NumberInput' }) }

export default function Page() {
  return (
    <NumberInputPage
      contract={readContract('number-input')}
      sources={{
        default: readExampleSource('number-input/default.tsx'),
        amount: readExampleSource('number-input/amount.tsx'),
        range: readExampleSource('number-input/range.tsx'),
        negative: readExampleSource('number-input/negative.tsx'),
        'unit-in-box': readExampleSource('number-input/unit-in-box.tsx'),
        'plain-text-box': readExampleSource('number-input/plain-text-box.tsx'),
      }}
    />
  )
}
