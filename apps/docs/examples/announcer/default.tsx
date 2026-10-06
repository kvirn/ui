'use client'
import { Button, useAnnouncer } from '@kvirn-ui/react'
import { useAnnouncerTexts } from './texts.ts'

export function DefaultAnnouncer() {
  const { texts, textLang } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  return (
    <Button lang={textLang} onClick={() => announce(texts.saved.message)}>
      {texts.saved.button}
    </Button>
  )
}
