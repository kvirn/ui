'use client'
import { Badge } from '@kvirn-ui/react'
import { useBadgeTexts } from './texts.ts'

export function WithContext() {
  const { texts, textLang } = useBadgeTexts()
  return (
    <dl lang={textLang}>
      <dt>{texts.summary.case}</dt>
      <dd>{texts.summary.caseValue}</dd>
      <dt>{texts.summary.status}</dt>
      <dd>
        <Badge variant="success">{texts.summary.statusValue}</Badge>
      </dd>
    </dl>
  )
}
