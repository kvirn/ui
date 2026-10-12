'use client'
import { Button, Icon } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'

export function IconOnly() {
  const { texts } = useExampleTexts()
  return (
    <Button className="kv-button--icon-only" aria-label={texts.button.closeLabel}>
      <Icon name="close" />
    </Button>
  )
}
