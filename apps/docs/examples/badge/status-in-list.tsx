'use client'
import { Badge } from '@kvirn-ui/react'
import { useBadgeTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function StatusInList() {
  const { texts, isFallback } = useBadgeTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <ul>
        {texts.cases.map((item) => (
          <li key={item.title}>
            {item.title} <Badge variant={item.variant}>{item.status}</Badge>
          </li>
        ))}
      </ul>
    </InEnglishWhenFallback>
  )
}
