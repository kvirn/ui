'use client'
import { Link, Tabs } from '@kvirn-ui/react'
import { useTabsTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function FocusablePanel() {
  const { texts, isFallback } = useTabsTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Tabs.Root defaultValue="decision">
        <Tabs.List aria-label={texts.list}>
          <Tabs.Tab value="details">{texts.details}</Tabs.Tab>
          <Tabs.Tab value="decision">{texts.decision}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">
          <p>{texts.detailsText}</p>
        </Tabs.Panel>
        <Tabs.Panel value="decision" tabIndex={-1}>
          <Link.Root href="#example">{texts.decisionLink}</Link.Root>
        </Tabs.Panel>
      </Tabs.Root>
    </InEnglishWhenFallback>
  )
}
