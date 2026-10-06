'use client'
import { Icon, VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function IconStatus() {
  const { texts, textLang } = useVisuallyHiddenTexts()
  return (
    <p lang={textLang}>
      <Icon name="check" /> <VisuallyHidden>{texts.approvedHidden}</VisuallyHidden>
      {texts.application}
    </p>
  )
}
