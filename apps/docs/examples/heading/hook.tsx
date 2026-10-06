'use client'
import { useHeading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'

export function OwnElement() {
  const { texts, textLang } = useHeadingTexts()
  const heading = useHeading({ level: 4, size: 'heading-3' })
  return (
    <h4 {...heading.rootProps} lang={textLang}>
      {texts.waste.heading}
    </h4>
  )
}
