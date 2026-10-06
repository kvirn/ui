'use client'
import { Accordion } from '@kvirn-ui/react'
import { useAccordionTexts } from './texts.ts'

export function FindInPage() {
  const { texts, textLang } = useAccordionTexts()
  return (
    <Accordion.Root hiddenUntilFound lang={textLang}>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.documents}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>{texts.documentsText}</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.appeal}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>{texts.appealText}</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.contact}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>{texts.contactText}</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}
