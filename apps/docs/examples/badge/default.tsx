'use client'
import { Badge } from '@kvirn-ui/react'
import { useBadgeTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultBadge() {
  const { texts, isFallback } = useBadgeTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        {texts.application} <Badge>{texts.draft}</Badge>
      </p>
    </InEnglishWhenFallback>
  )
}
