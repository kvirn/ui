'use client'
import { Heading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'

export function SizeApartFromLevel() {
  const { texts, textLang } = useHeadingTexts()
  return (
    <div lang={textLang}>
      <Heading level={4}>{texts.look.levelOnly}</Heading>
      <Heading level={4} size="heading-2">
        {texts.look.asLarger}
      </Heading>
    </div>
  )
}
