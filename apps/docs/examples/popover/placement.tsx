'use client'
import { Popover } from '@kvirn-ui/react'
import { usePopoverTexts } from './texts.ts'

export function Placement() {
  const { texts, textLang } = usePopoverTexts()
  return (
    <Popover.Root placement="bottom-end" offset={8}>
      <Popover.Trigger className="kv-button" lang={textLang}>
        {texts.help}
      </Popover.Trigger>
      <Popover.Popup aria-label={texts.help} lang={textLang}>
        <p>{texts.helpText}</p>
        <Popover.Close className="kv-button">{texts.close}</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  )
}
