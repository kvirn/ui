'use client'
import { Heading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'

export function DefaultHeading() {
  const { texts } = useHeadingTexts()
  return <Heading as="h3">{texts.contact.heading}</Heading>
}
