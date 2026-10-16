'use client'
import { allIcons } from '@kvirn-ui/icons/all'
import { Field, Icon, KvirnProvider, TextInput } from '@kvirn-ui/react'
import type { IconName } from '@kvirn-ui/react'
import { useId, useState } from 'react'

export interface IconLibraryEntry {
  name: string
  aliases: readonly string[]
  tags: readonly string[]
  meaning: string
  mirrorInRtl: boolean
}

export interface IconLibraryCategory {
  id: string
  title: string
  description: string
  icons: readonly IconLibraryEntry[]
}

const matches = (icon: IconLibraryEntry, words: readonly string[]) => {
  const haystack = [icon.name, ...icon.aliases, ...icon.tags, icon.meaning].join(' ').toLowerCase()
  return words.every((word) => haystack.includes(word))
}

export function IconLibrary({ categories }: { categories: readonly IconLibraryCategory[] }) {
  const [query, setQuery] = useState('')
  const resultsId = useId()
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const visible = categories
    .map((category) => ({
      ...category,
      icons: category.icons.filter((icon) => matches(icon, words)),
    }))
    .filter((category) => category.icons.length > 0)
  const total = visible.reduce((sum, category) => sum + category.icons.length, 0)

  return (
    <KvirnProvider icons={allIcons}>
      <Field.Root controlId="icon-search">
        <Field.Label>Search the icons</Field.Label>
        <TextInput
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          aria-controls={resultsId}
        />
        <Field.HelpText>Search by name, other names, tags or meaning.</Field.HelpText>
      </Field.Root>
      <output>
        {words.length === 0
          ? `${total} icons`
          : `${total} ${total === 1 ? 'icon matches' : 'icons match'}`}
      </output>
      <div id={resultsId}>
        {visible.map((category) => (
          <section key={category.id} aria-labelledby={`icons-${category.id}`}>
            <h3 id={`icons-${category.id}`}>
              {category.title} ({category.icons.length})
            </h3>
            <p>{category.description}</p>
            <ul role="list" className="docs-icon-list">
              {category.icons.map((icon) => (
                <li key={icon.name} className="docs-icon-item">
                  <Icon name={icon.name as IconName} size="24" />
                  <div>
                    <code>{icon.name}</code>
                    {icon.aliases.length > 0 ? <p>Also called: {icon.aliases.join(', ')}</p> : null}
                    <p>{icon.meaning}</p>
                    {icon.mirrorInRtl ? <p>Flips in right-to-left text.</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </KvirnProvider>
  )
}
