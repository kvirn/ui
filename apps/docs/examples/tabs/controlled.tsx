'use client'
import { Button, Tabs } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTabsTexts } from './texts.ts'

export function ControlledTabs() {
  const { texts, textLang } = useTabsTexts()
  const [value, setValue] = useState('details')
  return (
    <div lang={textLang}>
      <Tabs.Root value={value} onValueChange={setValue}>
        <Tabs.List aria-label={texts.list}>
          <Tabs.Tab value="details">{texts.details}</Tabs.Tab>
          <Tabs.Tab value="history">{texts.history}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">
          <p>{texts.detailsText}</p>
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <p>{texts.historyText}</p>
        </Tabs.Panel>
      </Tabs.Root>
      <p>
        {texts.selected} <strong>{value === 'details' ? texts.details : texts.history}</strong>
      </p>
      <Button onClick={() => setValue('history')}>{texts.showHistory}</Button>
    </div>
  )
}
