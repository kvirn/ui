'use client'
import { ButtonGroup, Button, Icon, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'

export function ButtonRow() {
  const { texts, textLang } = useTooltipTexts()
  const tools = [
    { name: texts.undo, icon: 'arrow-back' },
    { name: texts.redo, icon: 'arrow-forward' },
    { name: texts.print, icon: 'document' },
  ] as const
  return (
    <ButtonGroup aria-label={texts.group} lang={textLang}>
      {tools.map((tool) => (
        <Tooltip.Root key={tool.name}>
          <Tooltip.Trigger
            render={<Button className="kv-button--icon-only" aria-label={tool.name} />}
          >
            <Icon name={tool.icon} />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Name>{tool.name}</Tooltip.Name>
          </Tooltip.Popup>
        </Tooltip.Root>
      ))}
    </ButtonGroup>
  )
}
