'use client'
import { Menu } from '@kvirn-ui/react'
import { useMenuTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultMenu() {
  const { texts, isFallback } = useMenuTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Menu.Root>
        <Menu.Trigger className="kv-button">{texts.actions}</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onSelect={() => window.print()}>{texts.print}</Menu.Item>
          <Menu.Item>{texts.download}</Menu.Item>
          <Menu.Separator />
          <Menu.Item disabled>{texts.share}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </InEnglishWhenFallback>
  )
}
