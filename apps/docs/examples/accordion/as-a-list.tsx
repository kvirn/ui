'use client'
import { Accordion } from '@kvirn-ui/react'
import { useAccordionTexts } from './texts.ts'

export function AsAList() {
  const { texts, textLang } = useAccordionTexts()
  return (
    <Accordion.Root as="ul" aria-label={texts.list} lang={textLang}>
      <Accordion.Item as="li">
        <Accordion.Heading level={3}>
          <Accordion.Trigger>{texts.cost}</Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>{texts.costText}</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item as="li">
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
