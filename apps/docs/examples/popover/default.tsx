'use client'
import { Popover } from '@kvirn-ui/react'
import { usePopoverTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultPopover() {
  const { texts, isFallback } = usePopoverTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Popover.Root>
        <Popover.Trigger className="kv-button">{texts.about}</Popover.Trigger>
        <Popover.Popup aria-label={texts.about}>
          <p>{texts.aboutText}</p>
          <Popover.Close className="kv-button">{texts.close}</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
    </InEnglishWhenFallback>
  )
}
