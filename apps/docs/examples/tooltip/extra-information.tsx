'use client'
import { Button, Icon, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'

export function ExtraInformation() {
  const { texts } = useTooltipTexts()
  return (
    <Tooltip.Root>
      <Tooltip.Trigger as={Button} className="kv-button--icon-only" aria-label={texts.print}>
        <Icon name="document" />
      </Tooltip.Trigger>
      <Tooltip.Popup>{texts.printDescription}</Tooltip.Popup>
    </Tooltip.Root>
  )
}
