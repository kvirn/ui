'use client'
import { Menu } from '@kvirn-ui/react'
import { useMenuTexts } from './texts.ts'

export function DefaultMenu() {
  const { texts } = useMenuTexts()
  return (
    <Menu.Root>
      <Menu.Trigger className="kv-button">{texts.actions}</Menu.Trigger>
      <Menu.Popup>
        <Menu.Item onSelect={() => window.print()}>{texts.print}</Menu.Item>
        <Menu.Item>{texts.download}</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  )
}
