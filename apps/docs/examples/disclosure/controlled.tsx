'use client'
import { Button, Disclosure } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDisclosureTexts } from './texts.ts'

export function ControlledDisclosure() {
  const { texts } = useDisclosureTexts()
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Disclosure.Root open={open} onOpenChange={setOpen}>
        <Disclosure.Trigger>{texts.openingHours}</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>{texts.openingHoursText}</p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <p>{open ? texts.stateOpen : texts.stateClosed}</p>
      <Button aria-expanded={open} onClick={() => setOpen(!open)}>
        {texts.toggleIt}
      </Button>
    </div>
  )
}
