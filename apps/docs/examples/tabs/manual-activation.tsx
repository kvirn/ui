'use client'
import { Tabs } from '@kvirn-ui/react'
import { useTabsTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ManualActivation() {
  const { texts, isFallback } = useTabsTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Tabs.Root defaultValue="details" activationMode="manual">
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
    </InEnglishWhenFallback>
  )
}
