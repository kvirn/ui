'use client'

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Field,
  Heading,
  Link,
  List,
  Listbox,
  Pagination,
  Stack,
  Tag,
  TagGroup,
  TextInput,
  useAnnouncer,
  useFormat,
} from '@kvirn-ui/react'
import { en } from '@kvirn-ui/i18n/en'
import type { TextMessage } from '@kvirn-ui/i18n'
import { useState } from 'react'
import {
  kvirnbyPopularPages,
  kvirnbySearchQuery,
  kvirnbySearchResults,
} from '../../fixtures/search.ts'
import type { SearchResult, SearchResultKind } from '../../fixtures/search.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { NewsDate } from '../news-list/news-date.tsx'

export interface SearchResultsProps {
  /**
   * `results` (five hits), `one`, `many` (a page of ten of 27, with Pagination), `none` (a
   * misspelt word, no filters), `empty` (nothing typed yet) or `filtered` (two filters applied that
   * leave nothing). Filters and sort work from the states that have results. Default `results`.
   */
  state?: 'results' | 'one' | 'many' | 'none' | 'empty' | 'filtered' | undefined
}

type SortKey = 'relevance' | 'newest' | 'oldest' | 'name'

const text = (message: TextMessage) => (typeof message === 'function' ? message() : message)

const kindLabels: Record<SearchResultKind, string> = {
  service: 'Services',
  news: 'News',
  document: 'Documents',
}
const kinds = Object.keys(kindLabels) as SearchResultKind[]
const years = ['2026', '2025', '2024']
const totalHits = 27

const sortItems: readonly { key: SortKey; label: string }[] = [
  { key: 'relevance', label: text(en.filters.sortRelevance) },
  { key: 'newest', label: text(en.filters.sortNewest) },
  { key: 'oldest', label: text(en.filters.sortOldest) },
  { key: 'name', label: text(en.filters.sortNameAscending) },
]

const baseSizes = { results: 5, one: 1, many: 10, none: 0, empty: 0, filtered: 10 } as const

function sorted(results: readonly SearchResult[], sort: SortKey) {
  const copy = [...results]
  if (sort === 'newest') return copy.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
  if (sort === 'oldest') return copy.sort((a, b) => a.publishedOn.localeCompare(b.publishedOn))
  if (sort === 'name') return copy.sort((a, b) => a.title.localeCompare(b.title, 'en'))
  return copy
}

/**
 * The search page, the slot between header and footer: `h1`, the search form, the result count, the
 * filters, the results and the pagination. The filters change the results in place and say the new
 * count once, politely. Example text is English and fictional (Kvirnby municipality); the filter
 * words come from `filters.*` in English.
 */
export function SearchResults({ state = 'results' }: SearchResultsProps) {
  const format = useFormat()
  const { announce } = useAnnouncer()
  const [kindsApplied, setKindsApplied] = useState<string[]>(
    state === 'filtered' ? ['document'] : [],
  )
  const [yearsApplied, setYearsApplied] = useState<string[]>(state === 'filtered' ? ['2024'] : [])
  const [sort, setSort] = useState<SortKey>('relevance')

  const query = state === 'empty' ? '' : state === 'none' ? 'prescool' : kvirnbySearchQuery
  const base = kvirnbySearchResults.slice(0, baseSizes[state])
  const matching = (nextKinds: string[], nextYears: string[]) =>
    base.filter(
      (result) =>
        (nextKinds.length === 0 || nextKinds.includes(result.kind)) &&
        (nextYears.length === 0 || nextYears.includes(result.publishedOn.slice(0, 4))),
    )
  const results = sorted(matching(kindsApplied, yearsApplied), sort)
  const isFiltered = kindsApplied.length + yearsApplied.length > 0
  const count = state === 'many' && !isFiltered ? totalHits : results.length

  const appliedTags = [
    ...kindsApplied.map((value) => ({
      kind: 'kind' as const,
      value,
      label: en.filters.appliedValue({
        group: 'Type',
        value: kindLabels[value as SearchResultKind],
      }),
    })),
    ...yearsApplied.map((value) => ({
      kind: 'year' as const,
      value,
      label: en.filters.appliedValue({ group: 'Year', value }),
    })),
  ]

  const announceCount = (nextKinds: string[], nextYears: string[]) =>
    announce(en.filters.resultCount({ count: matching(nextKinds, nextYears).length }, format))

  const removeFilter = (kind: 'kind' | 'year', value: string, label: string) => {
    const nextKinds =
      kind === 'kind' ? kindsApplied.filter((entry) => entry !== value) : kindsApplied
    const nextYears =
      kind === 'year' ? yearsApplied.filter((entry) => entry !== value) : yearsApplied
    setKindsApplied(nextKinds)
    setYearsApplied(nextYears)
    announce(
      en.filters.removedResultCount(
        { label, count: matching(nextKinds, nextYears).length },
        format,
      ),
    )
  }

  return (
    <PageFrame.Main size="reading">
      <Stack className="kv-stack--gap-8">
        <Heading as="h1">Search</Heading>
        <search aria-label="Find a page">
          <form action="#search" method="get">
            <Stack className="kv-stack--gap-4">
              <Field.Root>
                <Field.Label marker="none">Search for</Field.Label>
                <TextInput type="search" name="q" defaultValue={query} autoComplete="off" />
              </Field.Root>
              <div>
                <Button type="submit">Search</Button>
              </div>
            </Stack>
          </form>
        </search>

        {state === 'empty' ? (
          <p>Type a word to search all pages on the website, for example “preschool”.</p>
        ) : state === 'none' ? null : (
          <>
            <form aria-labelledby="search-filter-heading">
              <input type="hidden" name="q" value={query} />
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="search-filter-heading">
                  {text(en.filters.heading)}
                </Heading>
                <CheckboxGroup.Root
                  name="kind"
                  value={kindsApplied}
                  onValueChange={(next) => {
                    setKindsApplied(next)
                    announceCount(next, yearsApplied)
                  }}
                >
                  <CheckboxGroup.Legend>Type of page</CheckboxGroup.Legend>
                  {kinds.map((value) => (
                    <Field.Root key={value}>
                      <Checkbox value={value} />
                      <Field.Label>{kindLabels[value]}</Field.Label>
                    </Field.Root>
                  ))}
                </CheckboxGroup.Root>
                <CheckboxGroup.Root
                  name="year"
                  value={yearsApplied}
                  onValueChange={(next) => {
                    setYearsApplied(next)
                    announceCount(kindsApplied, next)
                  }}
                >
                  <CheckboxGroup.Legend>Year</CheckboxGroup.Legend>
                  {years.map((value) => (
                    <Field.Root key={value}>
                      <Checkbox value={value} />
                      <Field.Label>{value}</Field.Label>
                    </Field.Root>
                  ))}
                </CheckboxGroup.Root>
                <Field.Root>
                  <Field.Label>{text(en.filters.sortLabel)}</Field.Label>
                  <Listbox.Root
                    native="always"
                    items={sortItems}
                    itemToString={(item) => item.label}
                    itemToKey={(item) => item.key}
                    value={sort}
                    onValueChange={(next) => setSort((next as SortKey | null) ?? 'relevance')}
                    name="sort"
                  />
                </Field.Root>
                <div>
                  <Button type="submit">{text(en.filters.apply)}</Button>
                </div>
              </Stack>
            </form>
            <TagGroup.Root announceRemoval={false}>
              <TagGroup.Label>{text(en.filters.applied)}</TagGroup.Label>
              <TagGroup.List>
                {appliedTags.map(({ kind, value, label }) => (
                  <Tag.Root key={`${kind}-${value}`}>
                    <Tag.Remove label={label} onRemove={() => removeFilter(kind, value, label)}>
                      {label}
                    </Tag.Remove>
                  </Tag.Root>
                ))}
              </TagGroup.List>
              <TagGroup.Empty>{text(en.filters.none)}</TagGroup.Empty>
              <TagGroup.ClearAll
                onClear={() => {
                  setKindsApplied([])
                  setYearsApplied([])
                  announce(en.filters.clearedResultCount({ count: base.length }, format))
                }}
              />
            </TagGroup.Root>
          </>
        )}

        {state === 'empty' ? null : (
          <Heading as="h2" size="heading-3">
            {en.filters.resultCount({ count }, format)}
          </Heading>
        )}

        {state === 'none' ? (
          <div className="kv-empty-state">
            <Heading as="h3" size="heading-4" className="kv-empty-state-title">
              Nothing matches “{query}”
            </Heading>
            <div className="kv-empty-state-body">
              <p>Check the spelling, or try a shorter or more general word.</p>
              <p>These pages are often visited:</p>
              <List.Root>
                {kvirnbyPopularPages.map((page) => (
                  <List.Item key={page.href}>
                    <Link.Root href={page.href}>{page.title}</Link.Root>
                  </List.Item>
                ))}
              </List.Root>
              <p>
                Still can’t find it?{' '}
                <Link.Root href="#contact">Contact the contact centre</Link.Root>.
              </p>
            </div>
          </div>
        ) : null}

        {state !== 'none' && state !== 'empty' && results.length === 0 ? (
          <div className="kv-empty-state">
            <Heading as="h3" size="heading-4" className="kv-empty-state-title">
              {text(en.filters.noResults)}
            </Heading>
            <p className="kv-empty-state-body">{text(en.filters.noResultsHint)}</p>
          </div>
        ) : null}

        {results.length > 0 ? (
          <List.Root as="ol" className="kv-list--gap-8">
            {results.map((result) => (
              <List.Item key={result.href}>
                <Stack className="kv-stack--gap-2">
                  <Heading as="h3" size="heading-4">
                    <Link.Root href={result.href}>{result.title}</Link.Root>
                  </Heading>
                  <p>
                    {result.path}
                    {' · '}
                    <NewsDate isoDate={result.publishedOn} />
                  </p>
                  <p>
                    {result.excerpt.map((part, index) =>
                      typeof part === 'string' ? part : <mark key={index}>{part.match}</mark>,
                    )}
                  </p>
                </Stack>
              </List.Item>
            ))}
          </List.Root>
        ) : null}

        {state === 'many' && !isFiltered ? (
          <Pagination.Root>
            <Pagination.List>
              {[1, 2, 3].map((number) => (
                <Pagination.Item key={number}>
                  <Pagination.Link page={number} href={`?page=${number}`} current={number === 1} />
                </Pagination.Item>
              ))}
              <Pagination.Item>
                <Pagination.Status page={1} total={3} />
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Next href="?page=2" />
              </Pagination.Item>
            </Pagination.List>
          </Pagination.Root>
        ) : null}
      </Stack>
    </PageFrame.Main>
  )
}
