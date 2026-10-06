'use client'
import { TableOfContents } from '@kvirn-ui/react'
import { useId, useMemo } from 'react'
import { useTableOfContentsTexts } from './texts.ts'

export function DefaultTableOfContents() {
  const { texts, textLang } = useTableOfContentsTexts()
  const titleId = useId()
  const items = useMemo(
    () => [
      { id: 'when-to-use', label: texts.whenToUse, level: 2 },
      { id: 'example', label: texts.example, level: 2 },
      { id: 'use-cases', label: texts.useCases, level: 2 },
      { id: 'accessibility', label: texts.accessibility, level: 2 },
      { id: 'keyboard', label: texts.keyboard, level: 2 },
      { id: 'api', label: texts.api, level: 2 },
    ],
    [texts],
  )
  return (
    <div lang={textLang}>
      <p id={titleId}>
        <strong>{texts.title}</strong>
      </p>
      <TableOfContents.Root aria-labelledby={titleId} items={items} />
    </div>
  )
}
