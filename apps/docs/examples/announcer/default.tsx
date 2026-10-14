'use client'
import { Button, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAnnouncerTexts } from './texts.ts'

export function DefaultAnnouncer() {
  const { texts } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  const [isSaved, setIsSaved] = useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setIsSaved(true)
          announce(texts.saved.message)
        }}
      >
        {texts.saved.button}
      </Button>
      {isSaved ? <p>{texts.saved.message}</p> : null}
    </>
  )
}
