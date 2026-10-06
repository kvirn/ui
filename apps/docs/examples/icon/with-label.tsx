'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function WithLabel() {
  const { texts, textLang } = useIconTexts()
  return (
    <p lang={textLang}>
      <Icon name="language" label={texts.language} /> {texts.currentLanguage}
    </p>
  )
}
