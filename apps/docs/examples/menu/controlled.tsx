'use client'
import { Menu } from '@kvirn-ui/react'
import { useState } from 'react'
import { useMenuTexts } from './texts.ts'

export function ControlledMenu() {
  const { texts, textLang } = useMenuTexts()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  return (
    <>
      <output lang={textLang}>
        {texts.last} <code>{reason === '' ? texts.none : reason}</code>
      </output>
      <Menu.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen)
          setReason(details.reason)
        }}
      >
        <Menu.Trigger className="kv-button" lang={textLang}>
          {texts.actions}
        </Menu.Trigger>
        <Menu.Popup lang={textLang}>
          <Menu.Item>{texts.print}</Menu.Item>
          <Menu.Item>{texts.download}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </>
  )
}
