'use client'
import { Button, Icon, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'

export function Timing() {
  const { texts, textLang } = useTooltipTexts()
  return (
    <Tooltip.Root delay={1000} closeDelay={300} placement="bottom">
      <Tooltip.Trigger
        as={Button}
        className="kv-button--icon-only"
        aria-label={texts.search}
        lang={textLang}
      >
        <Icon name="search" />
      </Tooltip.Trigger>
      <Tooltip.Popup lang={textLang}>
        <Tooltip.Name>{texts.search}</Tooltip.Name>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}
