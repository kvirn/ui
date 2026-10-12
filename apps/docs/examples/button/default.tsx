'use client'
import { Button } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultButton() {
  const { texts, isFallback } = useExampleTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Button>{texts.button.saveDraft}</Button>
    </InEnglishWhenFallback>
  )
}
