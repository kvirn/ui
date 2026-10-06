'use client'
import { Button } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'

export function DefaultButton() {
  const { texts, textLang } = useExampleTexts()
  return <Button lang={textLang}>{texts.button.saveDraft}</Button>
}
