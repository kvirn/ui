'use client'
import { Button, Field, Listbox } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { municipalities } from './data.ts'
import type { Municipality } from './data.ts'
import { useListboxTexts } from './texts.ts'

export function PlainFormListbox() {
  const { texts } = useListboxTexts()
  const [sent, setSent] = useState<string | undefined>()
  const [isInvalid, setIsInvalid] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const triggerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (isInvalid) {
      triggerRef.current?.focus()
    }
  }, [isInvalid, attempts])
  return (
    <form
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('municipality')
        const hasChoice = typeof value === 'string' && value !== ''
        setIsInvalid(!hasChoice)
        setAttempts((count) => count + 1)
        setSent(hasChoice ? value : undefined)
      }}
    >
      <Field.Root required invalid={isInvalid}>
        <Field.Label>{texts.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="municipality"
          placeholder={texts.municipalityPlaceholder}
          onValueChange={() => setIsInvalid(false)}
        >
          <Listbox.Trigger ref={triggerRef} />
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
        <Field.ErrorMessage>{texts.chooseError}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
      <output>{sent === undefined ? null : `${texts.sent}: ${sent}`}</output>
    </form>
  )
}
