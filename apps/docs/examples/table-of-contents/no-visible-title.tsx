'use client'
import { TableOfContents } from '@kvirn-ui/react'
import { useMemo } from 'react'
import { useTableOfContentsTexts } from './texts.ts'

export function NoVisibleTitle() {
  const { texts, textLang } = useTableOfContentsTexts()
  const items = useMemo(
    () => [
      { id: 'example', label: texts.example, level: 2 },
      { id: 'use-cases', label: texts.useCases, level: 2 },
      { id: 'api', label: texts.api, level: 2 },
    ],
    [texts],
  )
  return (
    <TableOfContents.Root
      items={items}
      messages={{ label: texts.nameFromMessage }}
      lang={textLang}
    />
  )
}
