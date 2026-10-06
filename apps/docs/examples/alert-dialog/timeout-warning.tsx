'use client'
import { AlertDialog } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useAlertDialogTexts } from './texts.ts'

export function TimeoutWarning() {
  const { texts, textLang } = useAlertDialogTexts()
  const [open, setOpen] = useState(false)
  const [isSignedOut, setIsSignedOut] = useState(false)
  const stayReference = useRef<HTMLButtonElement>(null)
  const returnReference = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button
        ref={returnReference}
        type="button"
        className="kv-button"
        lang={textLang}
        onClick={() => setOpen(true)}
      >
        {texts.showTimeout}
      </button>
      <AlertDialog.Root
        open={open}
        onOpenChange={setOpen}
        initialFocusRef={stayReference}
        finalFocusRef={returnReference}
      >
        <AlertDialog.Popup lang={textLang}>
          <AlertDialog.Title>{texts.timeoutTitle}</AlertDialog.Title>
          <AlertDialog.Description>{texts.timeoutDescription}</AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close ref={stayReference} className="kv-button kv-button--primary">
              {texts.timeoutStay}
            </AlertDialog.Close>
            <button
              type="button"
              className="kv-button"
              onClick={() => {
                setIsSignedOut(true)
                setOpen(false)
              }}
            >
              {texts.timeoutSignOut}
            </button>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <output lang={textLang}>{isSignedOut ? texts.signedOut : null}</output>
    </>
  )
}
