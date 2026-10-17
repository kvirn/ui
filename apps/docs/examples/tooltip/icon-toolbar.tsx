'use client'
import { Icon, Toolbar, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'

export function IconToolbar() {
  const { texts } = useTooltipTexts()
  const tools = [
    { name: texts.undo, icon: 'arrow-back' as const },
    { name: texts.redo, icon: 'arrow-forward' as const },
    { name: texts.print, icon: 'document' as const },
  ]
  return (
    <Toolbar.Root aria-label={texts.group}>
      {tools.map((tool) => (
        <Tooltip.Root key={tool.name}>
          <Tooltip.Trigger
            as={Toolbar.Button}
            className="kv-button--icon-only"
            aria-label={tool.name}
          >
            <Icon name={tool.icon} />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Name>{tool.name}</Tooltip.Name>
          </Tooltip.Popup>
        </Tooltip.Root>
      ))}
    </Toolbar.Root>
  )
}
