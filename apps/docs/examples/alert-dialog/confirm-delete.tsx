'use client'
import { AlertDialog } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useAlertDialogTexts } from './texts.ts'

export function ConfirmDelete() {
  const { texts, textLang } = useAlertDialogTexts()
  const [open, setOpen] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const keepReference = useRef<HTMLButtonElement>(null)
  return (
    <>
      <AlertDialog.Root open={open} onOpenChange={setOpen} initialFocusRef={keepReference}>
        <AlertDialog.Trigger className="kv-button" lang={textLang}>
          {texts.deleteDraft}
        </AlertDialog.Trigger>
        <AlertDialog.Popup lang={textLang}>
          <AlertDialog.Title>{texts.deleteTitle}</AlertDialog.Title>
          <AlertDialog.Description>{texts.deleteDescription}</AlertDialog.Description>
          <AlertDialog.Actions>
            <button
              type="button"
              className="kv-button kv-button--primary"
              onClick={() => {
                setIsDeleted(true)
                setOpen(false)
              }}
            >
              {texts.deleteConfirm}
            </button>
            <AlertDialog.Close ref={keepReference} className="kv-button">
              {texts.deleteKeep}
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <output lang={textLang}>{isDeleted ? texts.deleted : null}</output>
    </>
  )
}
