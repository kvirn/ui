'use client'
import { Badge } from '@kvirn-ui/react'
import { useBadgeTexts } from './texts.ts'

export function DefaultBadge() {
  const { texts, textLang } = useBadgeTexts()
  return (
    <p lang={textLang}>
      {texts.application} <Badge>{texts.draft}</Badge>
    </p>
  )
}
