'use client'
import { Badge } from '@kvirn-ui/react'
import { useBadgeTexts } from './texts.ts'

export function StatusInList() {
  const { texts } = useBadgeTexts()
  return (
    <ul>
      {texts.cases.map((item) => (
        <li key={item.title}>
          {item.title} <Badge variant={item.variant}>{item.status}</Badge>
        </li>
      ))}
    </ul>
  )
}
