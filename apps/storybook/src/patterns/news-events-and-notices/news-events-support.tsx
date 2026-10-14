import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider, useFormat } from '@kvirn-ui/react'
import type { ReactNode } from 'react'

// Shared by the S9 recipe stories. Story-only: dates go through the provider's `useFormat`, never hard-coded.

export function ExampleProvider({ children }: { children: ReactNode }) {
  return (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">{children}</div>
    </KvirnProvider>
  )
}

export function DateText({ iso }: { iso: string }) {
  const format = useFormat()
  return (
    <time dateTime={iso}>{format.date(new Date(iso), { dateStyle: 'long', timeZone: 'UTC' })}</time>
  )
}

export function TimeSpan({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const format = useFormat()
  const time = { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' } as const
  return (
    <>
      <DateText iso={startsAt} />,{' '}
      <time dateTime={startsAt}>{format.date(new Date(startsAt), time)}</time> to{' '}
      <time dateTime={endsAt}>{format.date(new Date(endsAt), time)}</time>
    </>
  )
}
