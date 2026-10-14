'use client'
import { Button, Field, Popover, TextInput } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { usePopoverTexts } from './texts.ts'

export function WithAForm() {
  const { texts } = usePopoverTexts()
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('070 123 45 67')
  const [message, setMessage] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <p>
        {texts.phoneNumber}: {phone}
      </p>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger ref={triggerRef} className="kv-button">
          {texts.changePhone}
        </Popover.Trigger>
        <Popover.Popup aria-label={texts.changePhone}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const value = new FormData(event.currentTarget).get('phone')
              if (typeof value === 'string' && value !== '') {
                setPhone(value)
                setMessage(texts.phoneSaved)
              }
              // You close it here, so move focus back to the button yourself.
              setOpen(false)
              triggerRef.current?.focus()
            }}
          >
            <Field.Root required>
              <Field.Label>{texts.phoneNumber}</Field.Label>
              <TextInput name="phone" type="tel" autoComplete="tel" defaultValue={phone} />
            </Field.Root>
            <p>
              <Button type="submit" className="kv-button--primary">
                {texts.save}
              </Button>{' '}
              <Popover.Close className="kv-button">{texts.cancel}</Popover.Close>
            </p>
          </form>
        </Popover.Popup>
      </Popover.Root>
      <output>{message}</output>
    </>
  )
}
