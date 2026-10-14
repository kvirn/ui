'use client'

import { Address, useFormat } from '@kvirn-ui/react'
import { referenceNewsMessages } from '../../../../messages/reference-news.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'

export function FormattedDate({ isoDate }: { isoDate: string }) {
  const format = useFormat()
  return (
    <time dateTime={isoDate}>
      {format.date(new Date(isoDate), { dateStyle: 'long', timeZone: 'UTC' })}
    </time>
  )
}

export function EventTime({
  startsAt,
  endsAt,
  to,
}: {
  startsAt: string
  endsAt: string
  to: string
}) {
  const format = useFormat()
  const time = { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' } as const
  return (
    <>
      <FormattedDate isoDate={startsAt} />,{' '}
      <time dateTime={startsAt}>{format.date(new Date(startsAt), time)}</time> {to}{' '}
      <time dateTime={endsAt}>{format.date(new Date(endsAt), time)}</time>
    </>
  )
}

export function ResultCount({
  from,
  to,
  total,
  locale,
}: {
  from: number
  to: number
  total: number
  locale: ReferenceLocale
}) {
  const format = useFormat()
  return (
    <p>
      {referenceNewsMessages[locale].news.count({
        from: format.number(from),
        to: format.number(to),
        total: format.number(total),
      })}
    </p>
  )
}

export function PlaceAddress({ lines }: { lines: readonly string[] }) {
  return (
    <Address>
      {lines.map((line, index) => (
        <span key={line}>
          {index > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </Address>
  )
}
