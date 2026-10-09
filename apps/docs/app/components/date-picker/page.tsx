import type { Metadata } from 'next'
import { DatePickerPage } from '../../../components/date-picker-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'DatePicker' }) }

export default function Page() {
  return (
    <DatePickerPage
      contract={readContract('date-picker')}
      sources={{
        default: readExampleSource('date-picker/default.tsx'),
        'masked-field': readExampleSource('date-picker/masked-field.tsx'),
        limits: readExampleSource('date-picker/limits.tsx'),
        'closed-days': readExampleSource('date-picker/closed-days.tsx'),
        'own-title': readExampleSource('date-picker/own-title.tsx'),
      }}
    />
  )
}
