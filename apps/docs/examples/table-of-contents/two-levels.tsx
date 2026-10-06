'use client'
import { TableOfContents } from '@kvirn-ui/react'
import { useId, useMemo } from 'react'
import { useTableOfContentsTexts } from './texts.ts'

export function TwoLevels() {
  const { texts, textLang } = useTableOfContentsTexts()
  const titleId = useId()
  const items = useMemo(
    () => [
      { id: 'example', label: texts.example, level: 2 },
      { id: 'use-cases', label: texts.useCases, level: 2 },
      { id: 'two-levels', label: texts.twoLevels, level: 3 },
      { id: 'own-markup', label: texts.ownMarkup, level: 3 },
      { id: 'no-visible-title', label: texts.noTitle, level: 3 },
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
