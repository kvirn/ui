'use client'
import { Badge, VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function DefaultVisuallyHidden() {
  const { texts } = useVisuallyHiddenTexts()
  return (
    <div>
      <p>
        {texts.messages} <Badge variant="primary">{texts.messageCount}</Badge>
        <VisuallyHidden>{texts.unreadHidden}</VisuallyHidden>
      </p>
      <p>
        <small>{texts.hint}</small>
      </p>
    </div>
  )
}
