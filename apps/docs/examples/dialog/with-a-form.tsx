'use client'
import { Dialog, Field, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDialogTexts } from './texts.ts'

export function WithAForm() {
  const { texts } = useDialogTexts()
  const [open, setOpen] = useState(false)
  const [sentTo, setSentTo] = useState('')
  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="kv-button">{texts.changePhone}</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>{texts.changePhoneTitle}</Dialog.Title>
          <Dialog.Close />
          <Dialog.Description>{texts.changePhoneText}</Dialog.Description>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const phone = new FormData(event.currentTarget).get('phone')
              setSentTo(typeof phone === 'string' ? phone : '')
              setOpen(false)
            }}
          >
            <Dialog.Body>
              <Field.Root required>
                <Field.Label>{texts.phoneNumber}</Field.Label>
                <TextInput name="phone" type="tel" autoComplete="tel" />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Actions>
              <button type="submit" className="kv-button kv-button--primary">
                {texts.save}
              </button>
              <Dialog.Close className="kv-button">{texts.keep}</Dialog.Close>
            </Dialog.Actions>
          </form>
        </Dialog.Popup>
      </Dialog.Root>
      <output>{sentTo === '' ? null : `${texts.phoneSaved} ${sentTo}.`}</output>
    </>
  )
}
