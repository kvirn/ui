'use client'
import { Button, Icon, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultTooltip() {
  const { texts, isFallback } = useTooltipTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Tooltip.Root>
        <Tooltip.Trigger as={Button} className="kv-button--icon-only" aria-label={texts.search}>
          <Icon name="search" />
        </Tooltip.Trigger>
        <Tooltip.Popup>
          <Tooltip.Name>{texts.search}</Tooltip.Name>
        </Tooltip.Popup>
      </Tooltip.Root>
    </InEnglishWhenFallback>
  )
}
