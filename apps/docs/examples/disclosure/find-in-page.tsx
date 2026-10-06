'use client'
import { Disclosure } from '@kvirn-ui/react'
import { useState } from 'react'
import { useDisclosureTexts } from './texts.ts'

export function FindInPage() {
  const { texts, textLang } = useDisclosureTexts()
  const [reason, setReason] = useState('–')
  return (
    <div lang={textLang}>
      <Disclosure.Root
        hiddenUntilFound
        onOpenChange={(_open, details) => setReason(details.reason)}
      >
        <Disclosure.Trigger>{texts.help}</Disclosure.Trigger>
        <Disclosure.Panel>
          <p>{texts.helpText}</p>
        </Disclosure.Panel>
      </Disclosure.Root>
      <p>
        {texts.lastReason} <code>{reason}</code>
      </p>
    </div>
  )
}
