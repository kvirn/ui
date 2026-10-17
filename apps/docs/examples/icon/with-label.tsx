'use client'
import { language } from '@kvirn-ui/icons'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function WithLabel() {
  const { texts } = useIconTexts()
  return (
    <p>
      <Icon icon={language} label={texts.language} /> <span lang="sv">{texts.currentLanguage}</span>
    </p>
  )
}
