'use client'
import { Alert } from '@kvirn-ui/react'
import { useAlertTexts } from './texts.ts'

export function DefaultAlert() {
  const { texts, textLang } = useAlertTexts()
  return (
    <Alert.Warning lang={textLang}>
      <Alert.Title>{texts.permit.title}</Alert.Title>
      <Alert.Body>
        <p>{texts.permit.body}</p>
      </Alert.Body>
    </Alert.Warning>
  )
}
