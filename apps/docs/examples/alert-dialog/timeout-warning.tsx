'use client'
import { AlertDialog, useFormat } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useAlertDialogTexts } from './texts.ts'

const secondsToExpiry = 120

export function TimeoutWarning() {
  const { texts } = useAlertDialogTexts()
  const format = useFormat()
  const [open, setOpen] = useState(false)
  const [expiresAt, setExpiresAt] = useState(0)
  const [minutesLeft, setMinutesLeft] = useState(secondsToExpiry / 60)
  const [outcome, setOutcome] = useState<string | undefined>()
  const stayReference = useRef<HTMLButtonElement>(null)
  const returnReference = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const timer = setInterval(() => {
      const secondsLeft = Math.ceil((expiresAt - Date.now()) / 1000)
      if (secondsLeft <= 0) {
        setOpen(false)
        setOutcome(texts.signedOut)
      } else {
        setMinutesLeft(Math.ceil(secondsLeft / 60))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [open, expiresAt, texts.signedOut])

  return (
    <>
      <button
        ref={returnReference}
        type="button"
        className="kv-button"
        onClick={() => {
          setExpiresAt(Date.now() + secondsToExpiry * 1000)
          setMinutesLeft(secondsToExpiry / 60)
          setOutcome(undefined)
          setOpen(true)
        }}
      >
        {texts.showTimeout}
      </button>
      <AlertDialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setOutcome(texts.stayed)
          }
        }}
        initialFocusRef={stayReference}
        finalFocusRef={returnReference}
      >
        <AlertDialog.Popup>
          <AlertDialog.Title>{texts.timeoutTitle}</AlertDialog.Title>
          <AlertDialog.Description>
            {texts.timeoutDescription(format.date(expiresAt, { timeStyle: 'short' }))}
          </AlertDialog.Description>
          <AlertDialog.Body>
            <output>{texts.timeoutRemaining(minutesLeft)}</output>
          </AlertDialog.Body>
          <AlertDialog.Actions>
            <AlertDialog.Close ref={stayReference} className="kv-button kv-button--primary">
              {texts.timeoutStay}
            </AlertDialog.Close>
            <button
              type="button"
              className="kv-button"
              onClick={() => {
                setOpen(false)
                setOutcome(texts.signedOut)
              }}
            >
              {texts.timeoutSignOut}
            </button>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <output>{outcome}</output>
    </>
  )
}
