'use client'
import { TableOfContents } from '@kvirn-ui/react'
import { useId, useMemo } from 'react'
import { useTableOfContentsTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnMarkup() {
  const { texts, isFallback } = useTableOfContentsTexts()
  const titleId = useId()
  const items = useMemo(
    () => [
      { id: 'example', label: texts.example, level: 2 },
      { id: 'use-cases', label: texts.useCases, level: 2 },
      { id: 'keyboard', label: texts.keyboard, level: 2 },
    ],
    [texts],
  )
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <p id={titleId}>
          <strong>{texts.title}</strong>
        </p>
        <TableOfContents.Root aria-labelledby={titleId} items={items}>
          {({ tree }) => (
            <>
              <TableOfContents.List>
                {tree.map((node) => (
                  <TableOfContents.Item key={node.item.id}>
                    <TableOfContents.Link item={node.item} />
                  </TableOfContents.Item>
                ))}
              </TableOfContents.List>
              <p>{texts.sectionCount({ count: tree.length })}</p>
            </>
          )}
        </TableOfContents.Root>
      </div>
    </InEnglishWhenFallback>
  )
}
