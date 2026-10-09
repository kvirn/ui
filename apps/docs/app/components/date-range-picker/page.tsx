import type { Metadata } from 'next'
import { DateRangePickerPage } from '../../../components/date-range-picker-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'DateRangePicker' }) }

export default function Page() {
  return (
    <DateRangePickerPage
      contract={readContract('date-range-picker')}
      sources={{
        default: readExampleSource('date-range-picker/default.tsx'),
        'nights-limit': readExampleSource('date-range-picker/nights-limit.tsx'),
        'booked-days': readExampleSource('date-range-picker/booked-days.tsx'),
        'own-title': readExampleSource('date-range-picker/own-title.tsx'),
      }}
    />
  )
}
