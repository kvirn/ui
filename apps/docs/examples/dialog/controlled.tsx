'use client'
import { Dialog } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDialogTexts } from './texts.ts'

export function ControlledDialog() {
  const { texts, textLang } = useDialogTexts()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('–')
  return (
    <>
      <p lang={textLang}>
        {open ? texts.stateOpen : texts.stateClosed}. {texts.lastReason} <code>{reason}</code>
      </p>
      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen)
          setReason(details.reason)
        }}
      >
        <Dialog.Trigger className="kv-button" lang={textLang}>
          {texts.help}
        </Dialog.Trigger>
        <Dialog.Popup lang={textLang}>
          <Dialog.Title>{texts.helpTitle}</Dialog.Title>
          <Dialog.Close />
          <Dialog.Body>
            <p>{texts.helpText}</p>
          </Dialog.Body>
          <Dialog.Actions>
            <Dialog.Close className="kv-button">{texts.understood}</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  )
}
