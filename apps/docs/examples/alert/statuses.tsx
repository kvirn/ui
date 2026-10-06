'use client'
import { Alert } from '@kvirn-ui/react'
import { useAlertTexts } from './texts.ts'

export function Statuses() {
  const { texts, textLang } = useAlertTexts()
  return (
    <div lang={textLang}>
      <Alert.Info>
        <Alert.Title render={<p />}>{texts.sample.title}</Alert.Title>
      </Alert.Info>
      <Alert.Success>
        <Alert.Title render={<p />}>{texts.sample.title}</Alert.Title>
      </Alert.Success>
      <Alert.Warning>
        <Alert.Title render={<p />}>{texts.sample.title}</Alert.Title>
      </Alert.Warning>
      <Alert.Danger>
        <Alert.Title render={<p />}>{texts.sample.title}</Alert.Title>
      </Alert.Danger>
    </div>
  )
}
