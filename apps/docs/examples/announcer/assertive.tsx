'use client'
import { Button, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAnnouncerTexts } from './texts.ts'

export function AssertiveAnnouncer() {
  const { texts } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  const [isExpired, setIsExpired] = useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setIsExpired(true)
          announce(texts.expired.message, { politeness: 'assertive' })
        }}
      >
        {texts.expired.button}
      </Button>
      {isExpired ? <p>{texts.expired.message}</p> : null}
    </>
  )
}
