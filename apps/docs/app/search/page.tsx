import { Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { DocsPage } from '../../components/docs-page.tsx'
import {
  componentPages,
  contentTypePages,
  patternGroups,
  siteSections,
} from '../../components/site-sections.ts'
import type { SitePage } from '../../components/site-sections.ts'
import { buildSearchIndex, searchEntries } from '../../lib/search-index.ts'
import type { SearchEntry } from '../../lib/search-index.ts'
import { messages } from '../../messages/en.ts'

const text = messages.docs.search

export const metadata: Metadata = { title: messages.docs.meta.title({ page: text.title }) }

interface Page extends SitePage {
  summary?: string
}

/** Every page of the site once, with its one-line job where it has one. */
function allPages(): readonly Page[] {
  const pages = new Map<string, Page>()
  const add = (page: Page) => {
    if (!pages.has(page.href)) {
      pages.set(page.href, page)
    }
  }
  siteSections.forEach((section) => section.pages.forEach(add))
  componentPages.forEach(add)
  contentTypePages.forEach(add)
  patternGroups.forEach((group) => group.pages.forEach(add))
  return [...pages.values()]
}

let searchIndex: readonly SearchEntry[] | undefined

function index(): readonly SearchEntry[] {
  searchIndex ??= buildSearchIndex(allPages())
  return searchIndex
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ''
  const results = searchEntries(index(), query)

  return (
    <DocsPage title={text.heading}>
      {query === '' ? (
        <p>{text.hint}</p>
      ) : (
        <>
          <h2>{text.resultsFor({ query, count: results.length })}</h2>
          {results.length === 0 ? (
            <p>{text.noResults}</p>
          ) : (
            <ul>
              {results.map(({ entry, excerpt }) => (
                <li key={entry.href}>
                  <Link href={entry.href}>{entry.label}</Link>
                  {entry.summary === undefined ? null : <p>{entry.summary}</p>}
                  {excerpt === undefined ? null : <p>{excerpt}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </DocsPage>
  )
}
