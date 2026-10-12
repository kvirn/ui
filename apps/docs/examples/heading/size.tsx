'use client'
import { Heading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'

export function SizeApartFromLevel() {
  const { texts } = useHeadingTexts()
  return (
    <div>
      <Heading as="h4">{texts.look.levelOnly}</Heading>
      <Heading as="h4" size="heading-2">
        {texts.look.asLarger}
      </Heading>
    </div>
  )
}
