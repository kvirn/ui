'use client'
import { Accordion } from '@kvirn-ui/react'
import { useAccordionTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OpenByDefault() {
  const { texts, isFallback } = useAccordionTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Accordion.Root>
        <Accordion.Item defaultOpen>
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
      </Accordion.Root>
    </InEnglishWhenFallback>
  )
}
