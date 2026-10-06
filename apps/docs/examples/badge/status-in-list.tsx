'use client'
import { Badge } from '@kvirn-ui/react'
import { useBadgeTexts } from './texts.ts'

export function StatusInList() {
  const { texts, textLang } = useBadgeTexts()
  return (
    <ul lang={textLang}>
      {texts.cases.map((item) => (
        <li key={item.title}>
          {item.title} <Badge variant={item.variant}>{item.status}</Badge>
        </li>
      ))}
    </ul>
  )
}
