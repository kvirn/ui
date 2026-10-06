import type { Metadata } from 'next'
import { DateInputPage } from '../../../components/date-input-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'DateInput' }) }

export default function Page() {
  return (
    <DateInputPage
      contract={readContract('date-input')}
      sources={{
        default: readExampleSource('date-input/default.tsx'),
        'not-a-birthday': readExampleSource('date-input/not-a-birthday.tsx'),
        'wrong-box': readExampleSource('date-input/wrong-box.tsx'),
        'paper-form-order': readExampleSource('date-input/paper-form-order.tsx'),
        controlled: readExampleSource('date-input/controlled.tsx'),
        'plain-form': readExampleSource('date-input/plain-form.tsx'),
        'no-auto-advance': readExampleSource('date-input/no-auto-advance.tsx'),
      }}
    />
  )
}
