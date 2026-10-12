'use client'
import { Button, useAnnouncer } from '@kvirn-ui/react'
import { useAnnouncerTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultAnnouncer() {
  const { texts, isFallback } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Button onClick={() => announce(texts.saved.message)}>{texts.saved.button}</Button>
    </InEnglishWhenFallback>
  )
}
