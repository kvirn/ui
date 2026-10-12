'use client'
import { Accordion } from '@kvirn-ui/react'
import { useAccordionTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function FindInPage() {
  const { texts, isFallback } = useAccordionTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Accordion.Root hiddenUntilFound>
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
    </InEnglishWhenFallback>
  )
}
