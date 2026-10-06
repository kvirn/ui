import type { Metadata } from 'next'
import { OneTimeCodePage } from '../../../components/one-time-code-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'OneTimeCode' }) }

export default function Page() {
  return (
    <OneTimeCodePage
      contract={readContract('one-time-code')}
      sources={{
        default: readExampleSource('one-time-code/default.tsx'),
        'two-groups': readExampleSource('one-time-code/two-groups.tsx'),
        'checked-as-entered': readExampleSource('one-time-code/checked-as-entered.tsx'),
        'plain-form': readExampleSource('one-time-code/plain-form.tsx'),
      }}
    />
  )
}
