'use client'
import { Dialog } from '@kvirn-ui/react'
import { useDialogTexts } from './texts.ts'

export function DefaultDialog() {
  const { texts } = useDialogTexts()
  return (
    <Dialog.Root dismissOnOutsidePress>
      <Dialog.Trigger className="kv-button">{texts.about}</Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Title>{texts.aboutTitle}</Dialog.Title>
        <Dialog.Close />
        <Dialog.Body>
          <p>{texts.aboutText}</p>
        </Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close className="kv-button">{texts.close}</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  )
}
