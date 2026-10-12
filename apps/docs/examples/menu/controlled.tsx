'use client'
import { Menu } from '@kvirn-ui/react'
import { useState } from 'react'
import { useMenuTexts } from './texts.ts'

export function ControlledMenu() {
  const { texts } = useMenuTexts()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  return (
    <>
      <output>
        {texts.last} <code>{reason === '' ? texts.none : reason}</code>
      </output>
      <Menu.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen)
          setReason(details.reason)
        }}
      >
        <Menu.Trigger className="kv-button">{texts.actions}</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>{texts.print}</Menu.Item>
          <Menu.Item>{texts.download}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </>
  )
}
