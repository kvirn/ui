'use client'
import { Disclosure } from '@kvirn-ui/react'
import { useDisclosureTexts } from './texts.ts'

export function DefaultDisclosure() {
  const { texts } = useDisclosureTexts()
  return (
    <Disclosure.Root>
      <Disclosure.Trigger>{texts.openingHours}</Disclosure.Trigger>
      <Disclosure.Panel>
        <p>{texts.openingHoursText}</p>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}
