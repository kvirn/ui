import type { Metadata } from 'next'
import { InputGroupPage } from '../../../components/input-group-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'InputGroup' }) }

export default function Page() {
  return (
    <InputGroupPage
      contract={readContract('input-group')}
      sources={{
        default: readExampleSource('input-group/default.tsx'),
        'search-with-clear': readExampleSource('input-group/search-with-clear.tsx'),
        invalid: readExampleSource('input-group/invalid.tsx'),
        'disabled-with-reason': readExampleSource('input-group/disabled-with-reason.tsx'),
      }}
    />
  )
}
