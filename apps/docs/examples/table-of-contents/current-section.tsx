'use client'
import { Disclosure, useTableOfContents } from '@kvirn-ui/react'
import { useId, useMemo } from 'react'
import { useTableOfContentsTexts } from './texts.ts'

export function CurrentSection() {
  const { texts } = useTableOfContentsTexts()
  const titleId = useId()
  const items = useMemo(
    () => [
      { id: 'example', label: texts.example, level: 2 },
      { id: 'use-cases', label: texts.useCases, level: 2 },
      { id: 'accessibility', label: texts.accessibility, level: 2 },
      { id: 'keyboard', label: texts.keyboard, level: 2 },
      { id: 'api', label: texts.api, level: 2 },
    ],
    [texts],
  )
  // The hook runs here, outside the panel, so the button can show activeId while the list is
  // closed. The nav's name points at the title alone: the words that change are not part of it.
  const contents = useTableOfContents({ items, labelledBy: titleId })
  const current = items.find((item) => item.id === contents.activeId)
  return (
    <Disclosure.Root>
      <Disclosure.Trigger>
        <span id={titleId}>{texts.title}</span>
        {current === undefined ? null : <span> ({texts.reading({ section: current.label })})</span>}
      </Disclosure.Trigger>
      <Disclosure.Panel>
        <nav {...contents.rootProps}>
          <ul {...contents.listProps}>
            {contents.tree.map((node) => (
              <li key={node.item.id} {...contents.itemProps}>
                <a {...contents.getLinkProps(node.item)}>{node.item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}
