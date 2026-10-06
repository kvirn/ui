'use client'
import { Tabs } from '@kvirn-ui/react'
import { useTabsTexts } from './texts.ts'

export function DefaultTabs() {
  const { texts, textLang } = useTabsTexts()
  return (
    <Tabs.Root defaultValue="details" lang={textLang}>
      <Tabs.List aria-label={texts.list}>
        <Tabs.Tab value="details">{texts.details}</Tabs.Tab>
        <Tabs.Tab value="documents">{texts.documents}</Tabs.Tab>
        <Tabs.Tab value="history">{texts.history}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="details">
        <p>{texts.detailsText}</p>
      </Tabs.Panel>
      <Tabs.Panel value="documents">
        <p>{texts.documentsText}</p>
      </Tabs.Panel>
      <Tabs.Panel value="history">
        <p>{texts.historyText}</p>
      </Tabs.Panel>
    </Tabs.Root>
  )
}
