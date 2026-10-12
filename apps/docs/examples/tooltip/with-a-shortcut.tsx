'use client'
import { Button, Icon, Kbd, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function WithAShortcut() {
  const { texts, isFallback } = useTooltipTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Tooltip.Root>
        <Tooltip.Trigger
          as={Button}
          className="kv-button--icon-only"
          aria-label={texts.undo}
          aria-keyshortcuts="Control+Z"
        >
          <Icon name="arrow-back" />
        </Tooltip.Trigger>
        <Tooltip.Popup>
          <Tooltip.Name>{texts.undo}</Tooltip.Name>
          <Tooltip.Shortcut>
            <Kbd>
              <Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd>
            </Kbd>
          </Tooltip.Shortcut>
        </Tooltip.Popup>
      </Tooltip.Root>
    </InEnglishWhenFallback>
  )
}
