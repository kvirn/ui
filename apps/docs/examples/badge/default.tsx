'use client'
import { Badge } from '@kvirn/ui'
import { useBadgeTexts } from './texts.ts'

export function DefaultBadge() {
  const { texts } = useBadgeTexts()
  return (
    <p>
      {texts.statusLabel} <Badge>{texts.draft}</Badge>
    </p>
  )
}
