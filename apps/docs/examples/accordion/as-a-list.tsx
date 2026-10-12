'use client'
import { Accordion } from '@kvirn-ui/react'
import { useAccordionTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function AsAList() {
  const { texts, isFallback } = useAccordionTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Accordion.Root as="ul" aria-label={texts.list}>
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
    </InEnglishWhenFallback>
  )
}
