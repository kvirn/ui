'use client'
import { Menu } from '@kvirn-ui/react'
import { useId } from 'react'
import { useMenuTexts } from './texts.ts'

export function Unavailable() {
  const { texts } = useMenuTexts()
  const reasonId = useId()
  return (
    <>
      <Menu.Root>
        <Menu.Trigger className="kv-button">{texts.actions}</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onSelect={() => window.print()}>{texts.print}</Menu.Item>
          <Menu.Item>{texts.download}</Menu.Item>
          <Menu.Separator />
          <Menu.Item disabled aria-describedby={reasonId}>
            {texts.share}
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <p id={reasonId}>{texts.shareReason}</p>
    </>
  )
}
