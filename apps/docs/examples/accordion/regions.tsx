'use client'
import { Accordion } from '@kvirn-ui/react'
import { useAccordionTexts } from './texts.ts'

export function Regions() {
  const { texts, textLang } = useAccordionTexts()
  return (
    <Accordion.Root lang={textLang}>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.documents}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel region>
          <p>{texts.documentsText}</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.appeal}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel region>
          <p>{texts.appealText}</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}
