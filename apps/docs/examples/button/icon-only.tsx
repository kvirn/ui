'use client'
import { Button, Icon } from '@kvirn-ui/react'
import { useButtonTexts } from './texts.ts'

export function IconOnly() {
  const { texts } = useButtonTexts()
  return (
    <Button className="kv-button--icon-only" aria-label={texts.closeLabel}>
      <Icon name="close" />
    </Button>
  )
}
