'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Sizes() {
  const { texts, isFallback } = useIconTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        {texts.sizes} <Icon name="info" size="16" /> <Icon name="info" />{' '}
        <Icon name="info" size="24" /> <Icon name="info" size="32" /> <Icon name="info" size="40" />
      </p>
    </InEnglishWhenFallback>
  )
}
