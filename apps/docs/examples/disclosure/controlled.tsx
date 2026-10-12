'use client'
import { Button, Disclosure } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDisclosureTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ControlledDisclosure() {
  const { texts, isFallback } = useDisclosureTexts()
  const [open, setOpen] = useState(false)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <Disclosure.Root open={open} onOpenChange={setOpen}>
          <Disclosure.Trigger>{texts.openingHours}</Disclosure.Trigger>
          <Disclosure.Panel>
            <p>{texts.openingHoursText}</p>
          </Disclosure.Panel>
        </Disclosure.Root>
        <p>{open ? texts.stateOpen : texts.stateClosed}</p>
        <Button onClick={() => setOpen(!open)}>{open ? texts.closeIt : texts.openIt}</Button>
      </div>
    </InEnglishWhenFallback>
  )
}
