'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function WithLabel() {
  const { texts, isFallback } = useIconTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        <Icon name="language" label={texts.language} /> {texts.currentLanguage}
      </p>
    </InEnglishWhenFallback>
  )
}
