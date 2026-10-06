'use client'
import { Accordion } from '@kvirn-ui/react'
import { useAccordionTexts } from './texts.ts'

export function DefaultAccordion() {
  const { texts, textLang } = useAccordionTexts()
  return (
    <Accordion.Root lang={textLang}>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.howToApply}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>{texts.howToApplyText}</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.cost}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>{texts.costText}</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.howLong}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>{texts.howLongText}</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}
