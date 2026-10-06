'use client'
import { Button, Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function DefaultIcon() {
  const { texts, textLang } = useIconTexts()
  return (
    <Button lang={textLang}>
      <Icon name="add" />
      {texts.addChild}
    </Button>
  )
}
