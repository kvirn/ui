'use client'
import { Button } from '@kvirn-ui/react'
import { useButtonTexts } from './texts.ts'

export function DefaultButton() {
  const { texts } = useButtonTexts()
  return <Button>{texts.saveDraft}</Button>
}
