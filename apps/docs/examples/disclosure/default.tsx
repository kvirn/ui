'use client'
import { Disclosure } from '@kvirn-ui/react'
import { useDisclosureTexts } from './texts.ts'

export function DefaultDisclosure() {
  const { texts, textLang } = useDisclosureTexts()
  return (
    <Disclosure.Root>
      <Disclosure.Trigger lang={textLang}>{texts.openingHours}</Disclosure.Trigger>
      <Disclosure.Panel lang={textLang}>
        <p>{texts.openingHoursText}</p>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}
