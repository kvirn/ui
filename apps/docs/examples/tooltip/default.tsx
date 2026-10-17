'use client'
import { search } from '@kvirn-ui/icons'
import { Button, Icon, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'

export function DefaultTooltip() {
  const { texts } = useTooltipTexts()
  return (
    <Tooltip.Root>
      <Tooltip.Trigger as={Button} className="kv-button--icon-only" aria-label={texts.search}>
        <Icon icon={search} />
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Name>{texts.search}</Tooltip.Name>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}
