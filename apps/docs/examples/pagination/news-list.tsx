'use client'
import { Pagination } from '@kvirn-ui/react'
import { usePaginationTexts } from './texts.ts'

export function NewsListPagination() {
  const { texts, textLang } = usePaginationTexts()
  return (
    <Pagination.Root label={texts.newsLabel} lang={textLang}>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous href="#news-4" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={1} href="#news-1" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={4} href="#news-4" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={5} href="#news-5" current />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={6} href="#news-6" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={10} href="#news-10" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Status page={5} total={10} />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next href="#news-6" />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  )
}
