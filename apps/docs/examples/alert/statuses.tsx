'use client'
import { Alert } from '@kvirn-ui/react'
import { useAlertTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Statuses() {
  const { texts, isFallback } = useAlertTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Alert.Info>
          <Alert.Title as="p">{texts.sample.title}</Alert.Title>
        </Alert.Info>
        <Alert.Success>
          <Alert.Title as="p">{texts.sample.title}</Alert.Title>
        </Alert.Success>
        <Alert.Warning>
          <Alert.Title as="p">{texts.sample.title}</Alert.Title>
        </Alert.Warning>
        <Alert.Danger>
          <Alert.Title as="p">{texts.sample.title}</Alert.Title>
        </Alert.Danger>
      </div>
    </InEnglishWhenFallback>
  )
}
