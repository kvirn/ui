'use client'

import { useFormat } from '@kvirn-ui/react'
import { NewsDate } from '../news-list/news-date.tsx'

/** "17 October 2026, 10:00 to 10:45", each part a `<time>` the machine can read, written with the provider's locale. */
export function EventTimeSpan({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const format = useFormat()
  const time = { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' } as const
  return (
    <>
      <NewsDate isoDate={startsAt} />,{' '}
      <time dateTime={startsAt}>{format.date(new Date(startsAt), time)}</time> to{' '}
      <time dateTime={endsAt}>{format.date(new Date(endsAt), time)}</time>
    </>
  )
}
