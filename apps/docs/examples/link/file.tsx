'use client'
import { Link, useFormat } from '@kvirn-ui/react'
import { useLinkFileTexts } from './texts.ts'

export function FileLink() {
  const { texts } = useLinkFileTexts()
  const format = useFormat()
  const size = format.number(2.5, {
    style: 'unit',
    unit: 'megabyte',
    maximumFractionDigits: 1,
  })
  return (
    <>
      <p>{texts.intro}</p>
      <p>
        <Link.Root as="a" href="#budget-2027-pdf">
          {texts.title} ({texts.format}, {size})
        </Link.Root>
      </p>
      <p>
        {texts.htmlLine} <Link.Root href="#budget-2027">{texts.htmlLink}</Link.Root>
      </p>
    </>
  )
}
