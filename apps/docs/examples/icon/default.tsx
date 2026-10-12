'use client'
import { Button, Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultIcon() {
  const { texts, isFallback } = useIconTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Button>
        <Icon name="add" />
        {texts.addChild}
      </Button>
    </InEnglishWhenFallback>
  )
}
