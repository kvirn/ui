'use client'
import { Button, Icon, Kbd, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'

export function WithAShortcut() {
  const { texts, textLang } = useTooltipTexts()
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        as={Button}
        className="kv-button--icon-only"
        aria-label={texts.undo}
        aria-keyshortcuts="Control+Z"
        lang={textLang}
      >
        <Icon name="arrow-back" />
      </Tooltip.Trigger>
      <Tooltip.Popup lang={textLang}>
        <Tooltip.Name>{texts.undo}</Tooltip.Name>
        <Tooltip.Shortcut>
          <Kbd>
            <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">Z</Kbd>
          </Kbd>
        </Tooltip.Shortcut>
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}
