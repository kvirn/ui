import type { TextMessage } from '@kvirn-ui/i18n'
import type { SearchResult, SearchResultKind } from '@kvirn-ui/patterns/fixtures'
import { Heading, Link, List, Stack } from '@kvirn-ui/react'
import { DateText } from '../news-events-and-notices/news-events-support.tsx'

// Shared by the S10 recipe stories. Story-only: the filter words are the `filters.*` keys, never typed here.

export { ExampleProvider } from '../news-events-and-notices/news-events-support.tsx'

export const filterText = (message: TextMessage) =>
  typeof message === 'function' ? message() : message

export const kindLabels: Record<SearchResultKind, string> = {
  service: 'Services',
  news: 'News',
  document: 'Documents',
}

export const kinds = Object.keys(kindLabels) as SearchResultKind[]
export const years = ['2026', '2025', '2024']

export function matchingResults(
  results: readonly SearchResult[],
  appliedKinds: readonly string[],
  appliedYears: readonly string[],
) {
  return results.filter(
    (result) =>
      (appliedKinds.length === 0 || appliedKinds.includes(result.kind)) &&
      (appliedYears.length === 0 || appliedYears.includes(result.publishedOn.slice(0, 4))),
  )
}

export function Hits({
  results,
  busy = false,
}: {
  results: readonly SearchResult[]
  busy?: boolean
}) {
  return (
    <List.Root as="ol" className="kv-list--gap-8" aria-busy={busy || undefined}>
      {results.map((result) => (
        <List.Item key={result.href}>
          <Stack className="kv-stack--gap-2">
            <Heading as="h3" size="heading-4">
              <Link.Root href={result.href}>{result.title}</Link.Root>
            </Heading>
            <p>
              {result.path}
              {' · '}
              <DateText iso={result.publishedOn} />
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
  )
}
