'use client'
import { Alert } from '@kvirn-ui/react'
import { useAlertTexts } from './texts.ts'

export function Statuses() {
  const { texts } = useAlertTexts()
  return (
    <div>
      <Alert.Info>
        <Alert.Title as="p">{texts.statuses.info}</Alert.Title>
      </Alert.Info>
      <Alert.Success>
        <Alert.Title as="p">{texts.statuses.success}</Alert.Title>
      </Alert.Success>
      <Alert.Warning>
        <Alert.Title as="p">{texts.statuses.warning}</Alert.Title>
      </Alert.Warning>
      <Alert.Danger>
        <Alert.Title as="p">{texts.statuses.danger}</Alert.Title>
      </Alert.Danger>
    </div>
  )
}
