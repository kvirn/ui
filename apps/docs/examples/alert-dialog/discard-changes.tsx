'use client'
import { AlertDialog, Dialog, Field, TextInput } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useAlertDialogTexts } from './texts.ts'

export function DiscardChanges() {
  const { texts } = useAlertDialogTexts()
  const [isEditing, setIsEditing] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const [savedEmail, setSavedEmail] = useState(texts.savedEmail)
  const [draftEmail, setDraftEmail] = useState(texts.savedEmail)
  const keepEditingReference = useRef<HTMLButtonElement>(null)
  const hasChanges = draftEmail !== savedEmail

  return (
    <>
      <Dialog.Root
        open={isEditing}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setDraftEmail(savedEmail)
            setIsEditing(true)
          } else if (hasChanges) {
            // Escape and Close are requests. Keep the dialog open and ask first.
            setIsAsking(true)
          } else {
            setIsEditing(false)
          }
        }}
      >
        <Dialog.Trigger className="kv-button">{texts.changeEmail}</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>{texts.changeEmailTitle}</Dialog.Title>
          <Dialog.Description>{texts.changeEmailText}</Dialog.Description>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSavedEmail(draftEmail)
              setIsEditing(false)
            }}
          >
            <Dialog.Body>
              <Field.Root required>
                <Field.Label>{texts.emailAddress}</Field.Label>
                <TextInput
                  type="email"
                  autoComplete="email"
                  value={draftEmail}
                  onChange={(event) => setDraftEmail(event.target.value)}
                />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Actions>
              <button type="submit" className="kv-button kv-button--primary">
                {texts.saveEmail}
              </button>
              <Dialog.Close className="kv-button">{texts.closeEmail}</Dialog.Close>
            </Dialog.Actions>
          </form>
          <AlertDialog.Root
            open={isAsking}
            onOpenChange={setIsAsking}
            initialFocusRef={keepEditingReference}
          >
            <AlertDialog.Popup>
              <AlertDialog.Title>{texts.discardTitle}</AlertDialog.Title>
              <AlertDialog.Description>{texts.discardDescription}</AlertDialog.Description>
              <AlertDialog.Actions>
                <button
                  type="button"
                  className="kv-button kv-button--danger"
                  onClick={() => {
                    setIsAsking(false)
                    setIsEditing(false)
                  }}
                >
                  {texts.discardConfirm}
                </button>
                <AlertDialog.Close ref={keepEditingReference} className="kv-button">
                  {texts.discardKeep}
                </AlertDialog.Close>
              </AlertDialog.Actions>
            </AlertDialog.Popup>
          </AlertDialog.Root>
        </Dialog.Popup>
      </Dialog.Root>
      <p>
        {texts.emailIs} {savedEmail}
      </p>
    </>
  )
}
