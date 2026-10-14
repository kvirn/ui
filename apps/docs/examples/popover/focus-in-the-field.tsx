'use client'
import { Button, Field, Popover, TextInput } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { usePopoverTexts } from './texts.ts'

export function FocusInTheField() {
  const { texts } = usePopoverTexts()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)

  // Opening never moves focus, so a screen reader user would hear only "expanded" and have to
  // find the popup. The popup stays hidden until `open` is true, so a focus() in a click handler
  // does nothing: move focus here, in an effect that runs after that render.
  useEffect(() => {
    if (open) {
      fieldRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger ref={triggerRef} className="kv-button">
          {texts.findApplication}
        </Popover.Trigger>
        <Popover.Popup aria-label={texts.findApplication}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const value = new FormData(event.currentTarget).get('application')
              if (typeof value === 'string' && value !== '') {
                setMessage(`${texts.showing} ${value}.`)
              }
              // You close it here, so move focus back to the button yourself.
              setOpen(false)
              triggerRef.current?.focus()
            }}
          >
            <Field.Root required>
              <Field.Label>{texts.applicationNumber}</Field.Label>
              <TextInput ref={fieldRef} name="application" />
            </Field.Root>
            <p>
              <Button type="submit" className="kv-button--primary">
                {texts.find}
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
