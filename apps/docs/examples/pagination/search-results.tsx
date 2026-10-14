'use client'
import { Pagination } from '@kvirn-ui/react'
import { usePaginationTexts } from './texts.ts'

const currentPage = 7
const totalPages = 24
// The search the visitor made. In your service it comes from the address or the request.
const search = { q: 'extension', type: 'building-permit' }

// The library draws the links you give it and never counts pages. Show the first and last page,
// the page before and after the current one, and an ellipsis where two or more pages are left out.
// A gap of one page shows that page, because an ellipsis there would hide a single number.
function visiblePages(current: number, total: number): (number | 'gap')[] {
  const shown = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
  const items: (number | 'gap')[] = []
  shown.forEach((page, index) => {
    const before = shown[index - 1]
    if (before !== undefined && page - before === 2) {
      items.push(before + 1)
    }
    if (before !== undefined && page - before > 2) {
      items.push('gap')
    }
    items.push(page)
  })
  return items
}

// Every address keeps the search words and the filter, so Back, a copied link and a new tab all
// open the same search on that page. The docs site starts it with `#` to stay on this page; in
// your service it starts with `?`.
function pageHref(page: number) {
  return `#${new URLSearchParams({ ...search, page: String(page) }).toString()}`
}

export function SearchResultsPagination() {
  const { texts } = usePaginationTexts()
  return (
    <Pagination.Root label={texts.searchLabel}>
      <Pagination.List>
        {currentPage > 1 ? (
          <Pagination.Item>
            <Pagination.Previous href={pageHref(currentPage - 1)} />
          </Pagination.Item>
        ) : null}
        {visiblePages(currentPage, totalPages).map((page, index) => (
          <Pagination.Item key={page === 'gap' ? `gap-${index}` : page}>
            {page === 'gap' ? (
              <Pagination.Ellipsis />
            ) : (
              <Pagination.Link page={page} href={pageHref(page)} current={page === currentPage} />
            )}
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Status page={currentPage} total={totalPages} />
        </Pagination.Item>
        {currentPage < totalPages ? (
          <Pagination.Item>
            <Pagination.Next href={pageHref(currentPage + 1)} />
          </Pagination.Item>
        ) : null}
      </Pagination.List>
    </Pagination.Root>
  )
}
