'use client'
import { allIcons } from '@kvirn-ui/icons/all'
import { getMessages } from '@kvirn-ui/react/server'
import {
  Button,
  CopyButton,
  Field,
  Icon,
  Link,
  Listbox,
  TextInput,
  useAnnouncer,
  VisuallyHidden,
} from '@kvirn-ui/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { FormEvent } from 'react'
import { iconCamelName, iconImportName } from '../lib/icon-import-name.ts'
import { messages } from '../messages/en.ts'

const text = messages.docs.icons
const iconMessages = getMessages('icons')

export interface IconLibraryEntry {
  name: string
  aliases: readonly string[]
  tags: readonly string[]
  meaning: string
  mirrorInRtl: boolean
  hasLabel: boolean
}

export interface IconLibraryCategory {
  id: string
  title: string
  description: string
  icons: readonly IconLibraryEntry[]
}

const allCategoriesKey = 'all'
const searchPath = '/icons'
const typingPauseMilliseconds = 500

/** `-`, `_` and camelCase boundaries count as spaces, so `chevronDown` is `chevron down`. */
const toWords = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter(Boolean)

const matches = (icon: IconLibraryEntry, words: readonly string[]) => {
  const haystack = [
    icon.name,
    iconImportName(icon.name),
    ...icon.aliases,
    ...icon.tags,
    icon.meaning,
  ]
    .flatMap(toWords)
    .join(' ')
  return words.every((word) => haystack.includes(word))
}

const subscribeNothing = () => () => {}

function IconTile({ icon, isHydrated }: { icon: IconLibraryEntry; isHydrated: boolean }) {
  const importName = iconImportName(icon.name)
  const label = icon.hasLabel
    ? iconMessages[iconCamelName(icon.name) as keyof typeof iconMessages]
    : undefined
  return (
    <li className="docs-icon-item">
      <Icon icon={allIcons[icon.name as keyof typeof allIcons]} size="24" />
      <div className="docs-icon-details">
        <code>{icon.name}</code>
        <div className="docs-icon-import">
          <span>{text.importLabel}</span> <code>{importName}</code>
          {isHydrated ? (
            <CopyButton
              className="kv-button--compact"
              text={`import { ${importName} } from '@kvirn-ui/icons'`}
            >
              {text.copy}
              <VisuallyHidden>{text.copyHidden({ importName })}</VisuallyHidden>
            </CopyButton>
          ) : null}
        </div>
        {icon.aliases.length > 0 ? <p>{text.aliases({ list: icon.aliases.join(', ') })}</p> : null}
        <p>{icon.meaning}</p>
        {icon.mirrorInRtl ? <p>{text.flips}</p> : null}
        {label === undefined ? null : <p>{text.label({ label })}</p>}
      </div>
    </li>
  )
}

export function IconLibrary({
  categories,
  initialQuery,
  initialCategory,
}: {
  categories: readonly IconLibraryCategory[]
  initialQuery: string
  initialCategory: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [categoryKey, setCategoryKey] = useState(initialCategory)
  const searchRef = useRef<HTMLInputElement>(null)
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { announce } = useAnnouncer()
  const isHydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  )

  useEffect(() => () => clearTimeout(pauseTimer.current), [])

  const selectedCategory = categories.find((category) => category.id === categoryKey)
  const words = toWords(query)
  const visible = categories
    .filter((category) => selectedCategory === undefined || category === selectedCategory)
    .map((category) => ({
      ...category,
      icons: category.icons.filter((icon) => matches(icon, words)),
    }))
    .filter((category) => category.icons.length > 0)

  const countText = (nextQuery: string, nextCategoryKey: string) => {
    const nextCategory = categories.find((category) => category.id === nextCategoryKey)
    const nextWords = toWords(nextQuery)
    const count = categories
      .filter((category) => nextCategory === undefined || category === nextCategory)
      .reduce(
        (sum, category) => sum + category.icons.filter((icon) => matches(icon, nextWords)).length,
        0,
      )
    return count === 0
      ? text.noMatch({ query: nextQuery.trim(), category: nextCategory?.title })
      : text.count({ count, query: nextQuery.trim(), category: nextCategory?.title })
  }

  const total = visible.reduce((sum, category) => sum + category.icons.length, 0)
  const trimmedQuery = query.trim()
  const isFiltered = trimmedQuery !== '' || selectedCategory !== undefined
  const heading = total === 0 ? undefined : countText(query, categoryKey)

  const keepUrl = (nextQuery: string, nextCategoryKey: string) => {
    const params = new URLSearchParams()
    if (nextQuery.trim() !== '') {
      params.set('q', nextQuery.trim())
    }
    if (categories.some((category) => category.id === nextCategoryKey)) {
      params.set('category', nextCategoryKey)
    }
    const search = params.toString()
    window.history.replaceState(null, '', search === '' ? searchPath : `${searchPath}?${search}`)
  }

  const apply = (nextQuery: string, nextCategoryKey: string, announceNow: boolean) => {
    setQuery(nextQuery)
    setCategoryKey(nextCategoryKey)
    keepUrl(nextQuery, nextCategoryKey)
    clearTimeout(pauseTimer.current)
    if (announceNow) {
      announce(countText(nextQuery, nextCategoryKey))
    }
  }

  const onQueryChange = (nextQuery: string) => {
    apply(nextQuery, categoryKey, false)
    pauseTimer.current = setTimeout(
      () => announce(countText(nextQuery, categoryKey)),
      typingPauseMilliseconds,
    )
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    apply(query, categoryKey, true)
  }

  const reset = (keepQuery: boolean) => {
    apply(keepQuery ? query : '', allCategoriesKey, true)
    searchRef.current?.focus()
  }

  const categoryItems = [
    { key: allCategoriesKey, label: text.allCategories },
    ...categories.map((category) => ({ key: category.id, label: category.title })),
  ]

  return (
    <>
      <search aria-label={text.searchRegion}>
        <form method="get" action={searchPath} onSubmit={onSubmit}>
          <Field.Root>
            <Field.Label marker="none">{text.searchLabel}</Field.Label>
            <TextInput
              ref={searchRef}
              type="search"
              name="q"
              autoComplete="off"
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
            />
            <Field.HelpText>{text.searchHelp}</Field.HelpText>
          </Field.Root>
          <Field.Root>
            <Field.Label marker="none">{text.categoryLabel}</Field.Label>
            <Listbox.Root
              native="always"
              name="category"
              items={categoryItems}
              itemToString={(item) => item.label}
              itemToKey={(item) => item.key}
              value={categoryKey}
              onValueChange={(next) =>
                apply(query, (next as string | null) ?? allCategoriesKey, true)
              }
            />
          </Field.Root>
          <div>
            <Button type="submit">{text.submit}</Button>
          </div>
        </form>
      </search>
      {total === 0 ? (
        <div className="kv-empty-state">
          <h2 className="kv-empty-state-title">
            {text.noMatch({ query: trimmedQuery, category: selectedCategory?.title })}
          </h2>
          <p className="kv-empty-state-body">{text.noMatchHelp}</p>
          <ul role="list">
            {selectedCategory === undefined ? null : (
              <li>
                <Link
                  href={
                    trimmedQuery === ''
                      ? searchPath
                      : `${searchPath}?q=${encodeURIComponent(trimmedQuery)}`
                  }
                  onClick={(event) => {
                    event.preventDefault()
                    reset(true)
                  }}
                >
                  {text.allCategoriesLink}
                </Link>
              </li>
            )}
            <li>
              <Link
                href={searchPath}
                onClick={(event) => {
                  event.preventDefault()
                  reset(false)
                }}
              >
                {text.clear}
              </Link>
            </li>
            <li>
              <Link href="/contact">{text.request}</Link>
            </li>
          </ul>
        </div>
      ) : (
        <>
          <p>
            {heading}
            {isFiltered ? (
              <>
                {' '}
                <Link
                  href={searchPath}
                  onClick={(event) => {
                    event.preventDefault()
                    reset(false)
                  }}
                >
                  {text.clear}
                </Link>
              </>
            ) : null}
          </p>
          {visible.map((category) => (
            <section key={category.id}>
              <h2 id={`icons-${category.id}`}>
                {category.title} ({category.icons.length})
              </h2>
              <p>{category.description}</p>
              <ul role="list" className="docs-icon-list">
                {category.icons.map((icon) => (
                  <IconTile key={icon.name} icon={icon} isHydrated={isHydrated} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </>
  )
}
