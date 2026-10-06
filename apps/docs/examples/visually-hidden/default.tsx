'use client'
import { VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function DefaultVisuallyHidden() {
  const { texts, textLang } = useVisuallyHiddenTexts()
  return (
    <div lang={textLang}>
      <p>
        {texts.unread}
        <VisuallyHidden>{texts.unreadHidden}</VisuallyHidden>
      </p>
      <p>
        <small>{texts.hint}</small>
      </p>
    </div>
  )
}
