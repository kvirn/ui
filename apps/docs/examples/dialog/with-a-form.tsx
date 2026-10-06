'use client'
import { Dialog } from '@kvirn-ui/react'
import { useDialogTexts } from './texts.ts'

export function WithAForm() {
  const { texts, textLang } = useDialogTexts()
  return (
    <Dialog.Root>
      <Dialog.Trigger className="kv-button" lang={textLang}>
        {texts.changePhone}
      </Dialog.Trigger>
      <Dialog.Popup lang={textLang}>
        <Dialog.Title>{texts.changePhoneTitle}</Dialog.Title>
        <Dialog.Close />
        <Dialog.Description>{texts.changePhoneText}</Dialog.Description>
        <form onSubmit={(event) => event.preventDefault()}>
          <Dialog.Body>
            <label>
              {texts.phoneNumber}
              <br />
              <input name="phone" type="tel" autoComplete="tel" className="kv-input" />
            </label>
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
  )
}
