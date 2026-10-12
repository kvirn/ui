'use client'
import { Heading } from '@kvirn-ui/react'
import { useHeadingTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function SizeApartFromLevel() {
  const { texts, isFallback } = useHeadingTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Heading as="h4">{texts.look.levelOnly}</Heading>
        <Heading as="h4" size="heading-2">
          {texts.look.asLarger}
        </Heading>
      </div>
    </InEnglishWhenFallback>
  )
}
