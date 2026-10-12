'use client'
import { Alert } from '@kvirn-ui/react'
import { useAlertTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultAlert() {
  const { texts, isFallback } = useAlertTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Alert.Warning>
        <Alert.Title>{texts.permit.title}</Alert.Title>
        <Alert.Body>
          <p>{texts.permit.body}</p>
        </Alert.Body>
      </Alert.Warning>
    </InEnglishWhenFallback>
  )
}
