'use client'
import { Menu } from '@kvirn-ui/react'
import { useState } from 'react'
import { useMenuTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function CheckboxAndRadioMenu() {
  const { texts, isFallback } = useMenuTexts()
  const [grid, setGrid] = useState(false)
  const [sort, setSort] = useState('name')
  const sortLabels: Record<string, string> = {
    name: texts.byName,
    date: texts.byDate,
    status: texts.byStatus,
  }
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <output>
          {grid ? texts.gridOn : texts.gridOff} {texts.sortedBy} {sortLabels[sort]}.
        </output>
        <Menu.Root>
          <Menu.Trigger className="kv-button">{texts.view}</Menu.Trigger>
          <Menu.Popup>
            <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid} closeOnSelect={false}>
              {texts.grid}
            </Menu.CheckboxItem>
            <Menu.Separator />
            <Menu.RadioGroup value={sort} onValueChange={setSort} aria-label={texts.sortBy}>
              <Menu.RadioItem value="name">{texts.byName}</Menu.RadioItem>
              <Menu.RadioItem value="date">{texts.byDate}</Menu.RadioItem>
              <Menu.RadioItem value="status">{texts.byStatus}</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Root>
      </>
    </InEnglishWhenFallback>
  )
}
