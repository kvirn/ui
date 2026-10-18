'use client'
import { getMessages } from '@kvirn-ui/react/server'
import { PageFrame } from '@kvirn-ui/patterns'
import {
  Breadcrumb,
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
} from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import { useSearchParams } from 'next/navigation'
import { Fragment, useMemo, useState } from 'react'
import { referenceSearchMessages } from '../../../../../messages/reference-search.ts'
import type { SearchKind } from '../../../../../messages/reference-search.ts'
import type { ReferenceLocale } from '../../../../../messages/reference.ts'

type SortKey = 'relevance' | 'name'

const pageSize = 4
const kinds: readonly SearchKind[] = ['service', 'news', 'information']

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function Marked({ text, terms }: { text: string; terms: readonly string[] }) {
  if (terms.length === 0) {
    return text
  }
  const parts = text.split(new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'i'))
  const lowered = terms.map((term) => term.toLowerCase())
  return parts.map((part, index) =>
    lowered.includes(part.toLowerCase()) ? (
      <mark key={index}>{part}</mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

export function ReferenceSearchResults({ locale }: { locale: ReferenceLocale }) {
  const text = referenceSearchMessages[locale]
  const filters = useMemo(
    () => getMessages('filters', { locale, messages: locale === 'sv' ? sv : undefined }),
    [locale],
  )
  const { announce } = useAnnouncer()
  const searchParams = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const requestedPage = Number(searchParams.get('page') ?? '1')
  const [appliedKinds, setAppliedKinds] = useState<string[]>(() =>
    searchParams.getAll('kind').filter((value) => kinds.includes(value as SearchKind)),
  )
  const [sort, setSort] = useState<SortKey>(() =>
    searchParams.get('sort') === 'name' ? 'name' : 'relevance',
  )

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const matches = text.entries.flatMap((entry) => {
    const haystack = `${entry.title} ${entry.excerpt}`.toLowerCase()
    if (terms.length === 0 || !terms.every((term) => haystack.includes(term))) {
      return []
    }
    const score = terms.reduce(
      (sum, term) => sum + (entry.title.toLowerCase().includes(term) ? 2 : 1),
      0,
    )
    return [{ entry, score }]
  })

  const matching = (applied: readonly string[]) =>
    matches.filter(({ entry }) => applied.length === 0 || applied.includes(entry.kind))
  const results = matching(appliedKinds)
    .toSorted((a, b) =>
      sort === 'name' ? a.entry.title.localeCompare(b.entry.title, locale) : b.score - a.score,
    )
    .map(({ entry }) => entry)

  const pageCount = Math.max(1, Math.ceil(results.length / pageSize))
  const page = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1
  const shown = results.slice((page - 1) * pageSize, page * pageSize)
  const pageHref = (number: number) => {
    const params = new URLSearchParams({ q: query })
    appliedKinds.forEach((value) => params.append('kind', value))
    if (sort !== 'relevance') {
      params.set('sort', sort)
    }
    if (number > 1) {
      params.set('page', String(number))
    }
    return `?${params.toString()}`
  }
  const href = (slug: string) => `/reference/${locale}/${slug}`
  const sortItems = [
    { key: 'relevance', label: filters.sortRelevance },
    { key: 'name', label: filters.sortNameAscending },
  ] as const
  const isEmpty = query === ''
  const hasNoMatches = !isEmpty && matches.length === 0
  const announceCount = (message: string) => announce(message)
  const kindLabel = (value: string) => text.kinds[value as SearchKind]

  return (
    <>
      <Breadcrumb.Root label={text.breadcrumb}>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href={`/reference/${locale}`}>{text.start}</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Current>{text.title}</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <PageFrame.Main size="form">
        <Stack className="kv-stack--gap-6">
          <Heading as="h1">{text.heading}</Heading>
          <search aria-label={text.searchLabel}>
            <form action={`/reference/${locale}/search`} method="get">
              <Field.Root>
                <Field.Label marker="none">{text.queryLabel}</Field.Label>
                <TextInput
                  key={query}
                  type="search"
                  name="q"
                  defaultValue={query}
                  autoComplete="off"
                />
              </Field.Root>
              <div>
                <Button type="submit">{text.submit}</Button>
              </div>
            </form>
          </search>
          {isEmpty ? <p>{text.prompt}</p> : null}
          {isEmpty || hasNoMatches ? null : (
            <>
              <form aria-labelledby="results-filter-heading">
                <input type="hidden" name="q" value={query} />
                <Stack className="kv-stack--gap-4">
                  <Heading as="h2" size="heading-3" id="results-filter-heading">
                    {filters.heading}
                  </Heading>
                  <CheckboxGroup.Root
                    name="kind"
                    value={appliedKinds}
                    onValueChange={(next) => {
                      setAppliedKinds(next)
                      announceCount(filters.resultCount({ count: matching(next).length }))
                    }}
                  >
                    <CheckboxGroup.Legend>{text.typeLegend}</CheckboxGroup.Legend>
                    {kinds.map((value) => (
                      <CheckboxGroup.Option key={value}>
                        <Checkbox value={value} />
                        <Field.Label>{kindLabel(value)}</Field.Label>
                      </CheckboxGroup.Option>
                    ))}
                  </CheckboxGroup.Root>
                  <Field.Root>
                    <Field.Label>{filters.sortLabel}</Field.Label>
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
                    <Button type="submit">{filters.apply}</Button>
                  </div>
                </Stack>
              </form>
              <TagGroup.Root announceRemoval={false}>
                <TagGroup.Label>{filters.applied}</TagGroup.Label>
                <TagGroup.List>
                  {appliedKinds.map((value) => {
                    const label = filters.appliedValue({
                      group: text.typeGroup,
                      value: kindLabel(value),
                    })
                    return (
                      <Tag.Root key={value}>
                        <Tag.Remove
                          label={label}
                          onRemove={() => {
                            const next = appliedKinds.filter((entry) => entry !== value)
                            setAppliedKinds(next)
                            announceCount(
                              filters.removedResultCount({
                                label,
                                count: matching(next).length,
                              }),
                            )
                          }}
                        >
                          {label}
                        </Tag.Remove>
                      </Tag.Root>
                    )
                  })}
                </TagGroup.List>
                <TagGroup.Empty>{filters.none}</TagGroup.Empty>
                <TagGroup.ClearAll
                  onClear={() => {
                    setAppliedKinds([])
                    announceCount(filters.clearedResultCount({ count: matches.length }))
                  }}
                />
              </TagGroup.Root>
              <Heading as="h2" size="heading-3">
                {filters.resultCount({ count: results.length })}
              </Heading>
            </>
          )}
          {hasNoMatches ? (
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                {filters.resultCount({ count: 0 })}
              </Heading>
              <div className="kv-empty-state">
                <Heading as="h3" size="heading-4" className="kv-empty-state-title">
                  {text.noMatchTitle({ query })}
                </Heading>
                <div className="kv-empty-state-body">
                  <p>{text.noMatchHint}</p>
                  <p>{text.popularIntro}</p>
                  <List.Root>
                    {text.popular.map((popular) => (
                      <List.Item key={popular.slug}>
                        <Link href={href(popular.slug)}>{popular.label}</Link>
                      </List.Item>
                    ))}
                  </List.Root>
                  <p>
                    {text.stillCantFind} <Link href={href('contact')}>{text.contactLink}</Link>.
                  </p>
                </div>
              </div>
            </Stack>
          ) : null}
          {!isEmpty && !hasNoMatches && results.length === 0 ? (
            <div className="kv-empty-state">
              <Heading as="h3" size="heading-4" className="kv-empty-state-title">
                {filters.noResults}
              </Heading>
              <p className="kv-empty-state-body">{filters.noResultsHint}</p>
            </div>
          ) : null}
          {shown.length > 0 ? (
            <List.Root as="ol" className="kv-list--gap-8" aria-label={text.resultsList}>
              {shown.map((entry, index) => (
                <List.Item key={`${entry.slug}-${index}`}>
                  <Stack className="kv-stack--gap-2">
                    <Heading as="h3" size="heading-4">
                      <Link href={href(entry.slug)}>
                        <Marked text={entry.title} terms={terms} />
                      </Link>
                    </Heading>
                    <p>
                      {entry.path}
                      {' · '}
                      {kindLabel(entry.kind)}
                    </p>
                    <p>
                      <Marked text={entry.excerpt} terms={terms} />
                    </p>
                  </Stack>
                </List.Item>
              ))}
            </List.Root>
          ) : null}
          {pageCount > 1 ? (
            <Pagination.Root>
              <Pagination.List>
                {page > 1 ? (
                  <Pagination.Item>
                    <Pagination.Previous href={pageHref(page - 1)} />
                  </Pagination.Item>
                ) : null}
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <Pagination.Item key={number}>
                    <Pagination.Link
                      page={number}
                      href={pageHref(number)}
                      current={number === page}
                    />
                  </Pagination.Item>
                ))}
                <Pagination.Item>
                  <Pagination.Status page={page} total={pageCount} />
                </Pagination.Item>
                {page < pageCount ? (
                  <Pagination.Item>
                    <Pagination.Next href={pageHref(page + 1)} />
                  </Pagination.Item>
                ) : null}
              </Pagination.List>
            </Pagination.Root>
          ) : null}
        </Stack>
      </PageFrame.Main>
    </>
  )
}
