'use client'
import { Disclosure } from '@kvirn-ui/react'
import { useDisclosureTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultDisclosure() {
  const { texts, isFallback } = useDisclosureTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Disclosure.Root>
        <Disclosure.Trigger>{texts.openingHours}</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>{texts.openingHoursText}</p>
        </Disclosure.Panel>
      </Disclosure.Root>
    </InEnglishWhenFallback>
  )
}
