'use client'
import { add } from '@kvirn-ui/icons'
import { Button, Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function DefaultIcon() {
  const { texts } = useIconTexts()
  return (
    <Button>
      <Icon icon={add} />
      {texts.addChild}
    </Button>
  )
}
