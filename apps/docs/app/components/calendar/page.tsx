import type { Metadata } from 'next'
import { CalendarPage } from '../../../components/calendar-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Calendar' }) }

export default function Page() {
  return (
    <CalendarPage
      contract={readContract('calendar')}
      sources={{
        default: readExampleSource('calendar/default.tsx'),
        'beside-a-field': readExampleSource('calendar/beside-a-field.tsx'),
        'bookable-window': readExampleSource('calendar/bookable-window.tsx'),
        'closed-days': readExampleSource('calendar/closed-days.tsx'),
        'week-numbers': readExampleSource('calendar/week-numbers.tsx'),
        'year-buttons': readExampleSource('calendar/year-buttons.tsx'),
        range: readExampleSource('calendar/range.tsx'),
      }}
    />
  )
}
