'use client'
import { useHeading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'

export function OwnElement() {
  const { texts } = useHeadingTexts()
  const heading = useHeading({ level: 4, size: 'heading-3' })
  return <h4 {...heading.rootProps}>{texts.waste.heading}</h4>
}
