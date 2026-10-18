'use client'
import { Divider, Heading } from '@kvirn-ui/react'
import { useDividerTexts } from './texts.ts'

export function DefaultDivider() {
  const { texts } = useDividerTexts()
  return (
    <>
      <Heading as="h4">{texts.hoursHeading}</Heading>
      <p>{texts.hours}</p>
      <Divider />
      <Heading as="h4">{texts.contactHeading}</Heading>
      <p>{texts.contact}</p>
    </>
  )
}
