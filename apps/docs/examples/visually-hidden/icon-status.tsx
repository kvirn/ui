'use client'
import { check } from '@kvirn-ui/icons'
import { Icon, VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function IconStatus() {
  const { texts } = useVisuallyHiddenTexts()
  return (
    <p>
      <Icon icon={check} /> <VisuallyHidden>{texts.approvedHidden}</VisuallyHidden>
      {texts.application}
    </p>
  )
}
