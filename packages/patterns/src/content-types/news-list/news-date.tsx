'use client'

import { useFormat } from '@kvirn-ui/react'

/** A date as the provider's locale writes it, inside a `<time>` the machine can read. */
export function NewsDate({ isoDate }: { isoDate: string }) {
  const format = useFormat()
  return (
    <time dateTime={isoDate}>
      {format.date(new Date(isoDate), { dateStyle: 'long', timeZone: 'UTC' })}
    </time>
  )
}
