'use client'
import { Button, Icon, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ExtraInformation() {
  const { texts, isFallback } = useTooltipTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Tooltip.Root>
        <Tooltip.Trigger as={Button} className="kv-button--icon-only" aria-label={texts.print}>
          <Icon name="document" />
        </Tooltip.Trigger>
        <Tooltip.Popup>{texts.printDescription}</Tooltip.Popup>
      </Tooltip.Root>
    </InEnglishWhenFallback>
  )
}
