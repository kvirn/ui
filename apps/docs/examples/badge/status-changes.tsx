'use client'
import { Badge, Button, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useBadgeTexts } from './texts.ts'

export function StatusChanges() {
  const { texts } = useBadgeTexts()
  const { announce } = useAnnouncer()
  const [isGranted, setIsGranted] = useState(false)
  const [message, setMessage] = useState<string | undefined>()

  const checkStatus = () => {
    // A real app asks the server. Here the first answer is "granted".
    const next = isGranted ? texts.statusCheck.same : texts.statusCheck.changed
    setIsGranted(true)
    setMessage(next)
    // The badge changes silently. Say the result, and show it in words too.
    announce(next)
  }

  return (
    <>
      <p>
        {texts.statusLabel}{' '}
        <Badge variant={isGranted ? 'success' : 'info'}>
          {isGranted ? texts.statusCheck.granted : texts.statusCheck.beingProcessed}
        </Badge>
      </p>
      <Button onClick={checkStatus}>{texts.statusCheck.check}</Button>
      {message === undefined ? null : <p>{message}</p>}
    </>
  )
}
