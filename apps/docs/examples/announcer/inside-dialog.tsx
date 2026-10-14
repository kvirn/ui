'use client'
import { Button, Dialog, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAnnouncerTexts } from './texts.ts'

// useAnnouncer is called in a component inside the dialog, so it finds the dialog's own live region.
function FreeTimes() {
  const { texts } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  const [message, setMessage] = useState('')

  const check = (day: string, freeTimes: number) => {
    const text = texts.booking.freeTimes(day, freeTimes)
    setMessage(text)
    announce(text)
  }

  return (
    <>
      <div className="kv-button-group">
        <Button onClick={() => check(texts.booking.monday, 3)}>{texts.booking.monday}</Button>
        <Button onClick={() => check(texts.booking.tuesday, 0)}>{texts.booking.tuesday}</Button>
      </div>
      <p>{message}</p>
    </>
  )
}

export function InsideDialog() {
  const { texts } = useAnnouncerTexts()
  return (
    <Dialog.Root>
      <Dialog.Trigger className="kv-button">{texts.booking.open}</Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Title>{texts.booking.title}</Dialog.Title>
        <Dialog.Close />
        <Dialog.Body>
          <FreeTimes />
        </Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close className="kv-button">{texts.booking.close}</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  )
}
