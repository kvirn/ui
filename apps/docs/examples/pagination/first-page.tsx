'use client'
import { Pagination } from '@kvirn-ui/react'
import { usePaginationTexts } from './texts.ts'

export function FirstPagePagination() {
  const { texts, textLang } = usePaginationTexts()
  return (
    <Pagination.Root label={texts.firstLabel} lang={textLang}>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Link page={1} href="#case-1" current />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={2} href="#case-2" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={3} href="#case-3" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Status page={1} total={3} />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next href="#case-2" />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  )
}
