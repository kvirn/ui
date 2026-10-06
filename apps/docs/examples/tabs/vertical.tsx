'use client'
import { Tabs } from '@kvirn-ui/react'
import { useTabsTexts } from './texts.ts'

export function VerticalTabs() {
  const { texts, textLang } = useTabsTexts()
  return (
    <Tabs.Root defaultValue="applicant" orientation="vertical" lang={textLang}>
      <Tabs.List aria-label={texts.sections}>
        <Tabs.Tab value="applicant">{texts.applicant}</Tabs.Tab>
        <Tabs.Tab value="property">{texts.property}</Tabs.Tab>
        <Tabs.Tab value="attachments">{texts.attachments}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="applicant">
        <p>{texts.applicantText}</p>
      </Tabs.Panel>
      <Tabs.Panel value="property">
        <p>{texts.propertyText}</p>
      </Tabs.Panel>
      <Tabs.Panel value="attachments">
        <p>{texts.attachmentsText}</p>
      </Tabs.Panel>
    </Tabs.Root>
  )
}
