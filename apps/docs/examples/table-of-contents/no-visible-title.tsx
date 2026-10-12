'use client'
import { TableOfContents } from '@kvirn-ui/react'
import { useMemo } from 'react'
import { useTableOfContentsTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NoVisibleTitle() {
  const { texts, isFallback } = useTableOfContentsTexts()
  const items = useMemo(
    () => [
      { id: 'example', label: texts.example, level: 2 },
      { id: 'use-cases', label: texts.useCases, level: 2 },
      { id: 'api', label: texts.api, level: 2 },
    ],
    [texts],
  )
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <TableOfContents.Root items={items} messages={{ label: texts.nameFromMessage }} />
    </InEnglishWhenFallback>
  )
}
