'use client'
import { Alert, AlertDialog } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useAlertDialogTexts } from './texts.ts'

export function FailedDelete() {
  const { texts } = useAlertDialogTexts()
  const [open, setOpen] = useState(false)
  const [tries, setTries] = useState(0)
  const [hasFailed, setHasFailed] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const keepReference = useRef<HTMLButtonElement>(null)

  const deleteBooking = () => {
    // A real app asks the server. Here the first try fails, so the error shows.
    if (tries === 0) {
      setTries(1)
      setHasFailed(true)
      return
    }
    setHasFailed(false)
    setIsDeleted(true)
    setOpen(false)
  }

  return (
    <>
      <AlertDialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setHasFailed(false)
          }
        }}
        initialFocusRef={keepReference}
      >
        <AlertDialog.Trigger className="kv-button">{texts.deleteBooking}</AlertDialog.Trigger>
        <AlertDialog.Popup>
          <AlertDialog.Title>{texts.bookingTitle}</AlertDialog.Title>
          <AlertDialog.Description>{texts.bookingDescription}</AlertDialog.Description>
          <AlertDialog.Body>
            {hasFailed ? (
              <Alert.Danger announce="polite">
                <Alert.Title as="p">{texts.bookingFailed}</Alert.Title>
              </Alert.Danger>
            ) : null}
          </AlertDialog.Body>
          <AlertDialog.Actions>
            <button type="button" className="kv-button kv-button--danger" onClick={deleteBooking}>
              {texts.bookingConfirm}
            </button>
            <AlertDialog.Close ref={keepReference} className="kv-button">
              {texts.bookingKeep}
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <output>{isDeleted ? texts.bookingDeleted : null}</output>
    </>
  )
}
