'use client'
import { Button } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'

export function DefaultButton() {
  const { texts } = useExampleTexts()
  return <Button>{texts.button.saveDraft}</Button>
}
