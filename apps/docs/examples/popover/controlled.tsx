'use client'
import { Popover } from '@kvirn-ui/react'
import { useState } from 'react'
import { usePopoverTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ControlledPopover() {
  const { texts, isFallback } = usePopoverTexts()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('–')
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <p>
          {open ? texts.stateOpen : texts.stateClosed}. {texts.lastReason} <code>{reason}</code>
        </p>
        <Popover.Root
          open={open}
          onOpenChange={(nextOpen, details) => {
            setOpen(nextOpen)
            setReason(details.reason)
          }}
        >
          <Popover.Trigger className="kv-button">{texts.help}</Popover.Trigger>
          <Popover.Popup aria-label={texts.help}>
            <p>{texts.helpText}</p>
            <Popover.Close className="kv-button">{texts.close}</Popover.Close>
          </Popover.Popup>
        </Popover.Root>
      </>
    </InEnglishWhenFallback>
  )
}
