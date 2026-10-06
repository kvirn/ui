'use client'
import { Menu } from '@kvirn-ui/react'
import { useMenuTexts } from './texts.ts'

export function DefaultMenu() {
  const { texts, textLang } = useMenuTexts()
  return (
    <Menu.Root>
      <Menu.Trigger className="kv-button" lang={textLang}>
        {texts.actions}
      </Menu.Trigger>
      <Menu.Popup lang={textLang}>
        <Menu.Item onSelect={() => window.print()}>{texts.print}</Menu.Item>
        <Menu.Item>{texts.download}</Menu.Item>
        <Menu.Separator />
        <Menu.Item disabled>{texts.share}</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  )
}
