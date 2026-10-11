import { Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { PageHeading } from '../../components/page-heading.tsx'
import {
  componentPages,
  contentTypePages,
  patternGroups,
  siteSections,
} from '../../components/site-sections.ts'
import type { SitePage } from '../../components/site-sections.ts'
import { messages } from '../../messages/en.ts'

const text = messages.docs.search

export const metadata: Metadata = { title: messages.docs.meta.title({ page: text.title }) }

interface Result extends SitePage {
  summary?: string
}

/** Every page of the site once, with its one-line job where it has one. */
function allPages(): readonly Result[] {
  const pages = new Map<string, Result>()
  const add = (page: Result) => {
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

/** The pages whose title or one-line job contains every word of the query. */
function search(query: string): readonly Result[] {
  const words = query.toLocaleLowerCase('en').split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return []
  }
  return allPages().filter((page) => {
    const haystack = `${page.label} ${page.summary ?? ''}`.toLocaleLowerCase('en')
    return words.every((word) => haystack.includes(word))
  })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ''
  const results = search(query)

  return (
    <>
      <PageHeading>{text.heading}</PageHeading>
      {query === '' ? (
        <p>{text.hint}</p>
      ) : (
        <>
          <h2>{text.resultsFor({ query, count: results.length })}</h2>
          {results.length === 0 ? (
            <p>{text.noResults}</p>
          ) : (
            <ul>
              {results.map((page) => (
                <li key={page.href}>
                  <Link href={page.href}>{page.label}</Link>
                  {page.summary === undefined ? null : <p>{page.summary}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}
