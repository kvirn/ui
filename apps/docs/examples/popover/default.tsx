'use client'
import { Popover } from '@kvirn-ui/react'
import { usePopoverTexts } from './texts.ts'

export function DefaultPopover() {
  const { texts, textLang } = usePopoverTexts()
  return (
    <Popover.Root>
      <Popover.Trigger className="kv-button" lang={textLang}>
        {texts.about}
      </Popover.Trigger>
      <Popover.Popup aria-label={texts.about} lang={textLang}>
        <p>{texts.aboutText}</p>
        <Popover.Close className="kv-button">{texts.close}</Popover.Close>
      </Popover.Popup>
    </Popover.Root>
  )
}
