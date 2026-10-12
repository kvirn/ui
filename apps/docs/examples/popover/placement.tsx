'use client'
import { Popover } from '@kvirn-ui/react'
import { usePopoverTexts } from './texts.ts'

export function Placement() {
  const { texts } = usePopoverTexts()
  return (
    <Popover.Root placement="bottom-end" offset={8}>
      <Popover.Trigger className="kv-button">{texts.help}</Popover.Trigger>
      <Popover.Popup aria-label={texts.help}>
        <p>{texts.helpText}</p>
        <Popover.Close className="kv-button">{texts.close}</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  )
}
