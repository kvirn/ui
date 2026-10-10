'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function Sizes() {
  const { texts, textLang } = useIconTexts()
  return (
    <p lang={textLang}>
      {texts.sizes} <Icon name="info" size="16" /> <Icon name="info" />{' '}
      <Icon name="info" size="24" /> <Icon name="info" size="32" /> <Icon name="info" size="40" />
    </p>
  )
}
