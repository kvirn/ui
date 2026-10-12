'use client'
import { Button, Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function DefaultIcon() {
  const { texts } = useIconTexts()
  return (
    <Button>
      <Icon name="add" />
      {texts.addChild}
    </Button>
  )
}
