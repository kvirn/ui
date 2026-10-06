'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function Sizes() {
  const { texts, textLang } = useIconTexts()
  return (
    <p lang={textLang}>
      {texts.sizes} <Icon name="info" size={4} /> <Icon name="info" /> <Icon name="info" size={6} />{' '}
      <Icon name="info" size={8} /> <Icon name="info" size="2.5rem" />
    </p>
  )
}
