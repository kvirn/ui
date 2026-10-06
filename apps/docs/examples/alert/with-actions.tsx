'use client'
import { Alert, Button, Link } from '@kvirn-ui/react'
import { useAlertTexts } from './texts.ts'

export function WithActions() {
  const { texts, textLang } = useAlertTexts()
  return (
    <Alert.Danger lang={textLang}>
      <Alert.Title>{texts.failed.title}</Alert.Title>
      <Alert.Body>
        <p>{texts.failed.body}</p>
      </Alert.Body>
      <Alert.Actions>
        <Button>{texts.failed.retry}</Button>
        <Link href="#with-actions">{texts.failed.contact}</Link>
      </Alert.Actions>
    </Alert.Danger>
  )
}
