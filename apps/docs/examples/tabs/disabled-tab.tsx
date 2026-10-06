'use client'
import { Tabs } from '@kvirn-ui/react'
import { useId } from 'react'
import { useTabsTexts } from './texts.ts'

export function DisabledTab() {
  const { texts, textLang } = useTabsTexts()
  const reasonId = useId()
  return (
    <Tabs.Root defaultValue="details" lang={textLang}>
      <Tabs.List aria-label={texts.list}>
        <Tabs.Tab value="details">{texts.details}</Tabs.Tab>
        <Tabs.Tab value="decision" disabled aria-describedby={reasonId}>
          {texts.decision}
        </Tabs.Tab>
      </Tabs.List>
      <p id={reasonId}>{texts.decisionReason}</p>
      <Tabs.Panel value="details">
        <p>{texts.detailsText}</p>
      </Tabs.Panel>
      <Tabs.Panel value="decision">
        <p>{texts.decisionText}</p>
      </Tabs.Panel>
    </Tabs.Root>
  )
}
