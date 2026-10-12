'use client'
import { Button, Icon, Kbd, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'

export function WithAShortcut() {
  const { texts } = useTooltipTexts()
  return (
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
  )
}
