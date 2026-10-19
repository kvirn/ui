'use client'
import { Alert } from '@kvirn-ui/react'
import { useId } from 'react'
import { useAlertTexts } from './texts.ts'

export function SiteWide() {
  const { texts } = useAlertTexts()
  const titleId = useId()
  return (
    <Alert.Warning as="section" aria-labelledby={titleId}>
      <Alert.Title id={titleId}>{texts.siteWide.title}</Alert.Title>
      <Alert.Body>
        <p>{texts.siteWide.body}</p>
      </Alert.Body>
    </Alert.Warning>
  )
}
