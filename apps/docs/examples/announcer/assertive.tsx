'use client'
import { Button, useAnnouncer } from '@kvirn-ui/react'
import { useAnnouncerTexts } from './texts.ts'

export function AssertiveAnnouncer() {
  const { texts } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  return (
    <Button onClick={() => announce(texts.expired.message, { politeness: 'assertive' })}>
      {texts.expired.button}
    </Button>
  )
}
