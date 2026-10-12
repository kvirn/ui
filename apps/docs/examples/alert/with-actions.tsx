'use client'
import { Alert, Button, Link } from '@kvirn-ui/react'
import { useAlertTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function WithActions() {
  const { texts, isFallback } = useAlertTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Alert.Danger>
        <Alert.Title>{texts.failed.title}</Alert.Title>
        <Alert.Body>
          <p>{texts.failed.body}</p>
        </Alert.Body>
        <Alert.Actions>
          <Button>{texts.failed.retry}</Button>
          <Link href="#with-actions">{texts.failed.contact}</Link>
        </Alert.Actions>
      </Alert.Danger>
    </InEnglishWhenFallback>
  )
}
