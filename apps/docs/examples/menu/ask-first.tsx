'use client'
import { AlertDialog, Menu } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useMenuTexts } from './texts.ts'

export function AskFirst() {
  const { texts } = useMenuTexts()
  const [open, setOpen] = useState(false)
  const [isWithdrawn, setIsWithdrawn] = useState(false)
  const keepReference = useRef<HTMLButtonElement>(null)
  return (
    <>
      <Menu.Root>
        <Menu.Trigger className="kv-button">{texts.actions}</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onSelect={() => window.print()}>{texts.print}</Menu.Item>
          <Menu.Item onSelect={() => setOpen(true)}>{texts.withdraw}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <AlertDialog.Root open={open} onOpenChange={setOpen} initialFocusRef={keepReference}>
        <AlertDialog.Popup>
          <AlertDialog.Title>{texts.withdrawTitle}</AlertDialog.Title>
          <AlertDialog.Description>{texts.withdrawText}</AlertDialog.Description>
          <AlertDialog.Actions>
            <button
              type="button"
              className="kv-button kv-button--primary"
              onClick={() => {
                setIsWithdrawn(true)
                setOpen(false)
              }}
            >
              {texts.withdrawConfirm}
            </button>
            <AlertDialog.Close ref={keepReference} className="kv-button">
              {texts.withdrawKeep}
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <output>{isWithdrawn ? texts.withdrawn : null}</output>
    </>
  )
}
