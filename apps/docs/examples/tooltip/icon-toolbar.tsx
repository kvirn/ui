'use client'
import { arrowBack, arrowForward, document as documentIcon } from '@kvirn-ui/icons'
import { Icon, Toolbar, Tooltip } from '@kvirn-ui/react'
import { useTooltipTexts } from './texts.ts'

export function IconToolbar() {
  const { texts } = useTooltipTexts()
  const tools = [
    { name: texts.undo, icon: arrowBack },
    { name: texts.redo, icon: arrowForward },
    { name: texts.print, icon: documentIcon },
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
            <Icon icon={tool.icon} />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Name>{tool.name}</Tooltip.Name>
          </Tooltip.Popup>
        </Tooltip.Root>
      ))}
    </Toolbar.Root>
  )
}
