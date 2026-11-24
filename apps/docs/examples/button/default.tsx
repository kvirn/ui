'use client'
import { Button } from '@kvirn/ui'
import { useButtonTexts } from './texts.ts'

export function DefaultButton() {
  const { texts } = useButtonTexts()
  return <Button>{texts.saveDraft}</Button>
}
