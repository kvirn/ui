'use client'
import { Heading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'

export function DefaultHeading() {
  const { texts, textLang } = useHeadingTexts()
  return (
    <Heading as="h3" lang={textLang}>
      {texts.contact.heading}
    </Heading>
  )
}
