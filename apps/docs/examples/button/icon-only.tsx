'use client'
import { Button, Icon } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function IconOnly() {
  const { texts, isFallback } = useExampleTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Button className="kv-button--icon-only" aria-label={texts.button.closeLabel}>
        <Icon name="close" />
      </Button>
    </InEnglishWhenFallback>
  )
}
