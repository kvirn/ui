'use client'
import { Pagination } from '@kvirn-ui/react'
import { usePaginationTexts } from './texts.ts'

export function OwnWordsPagination() {
  const { texts } = usePaginationTexts()
  return (
    <Pagination.Root label={texts.ownWordsLabel}>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous href="#search-1">{texts.back}</Pagination.Previous>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={1} href="#search-1" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={2} href="#search-2" current />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={3} href="#search-3" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Status page={2} total={3}>
            {texts.status}
          </Pagination.Status>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next href="#search-3">{texts.forward}</Pagination.Next>
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  )
}
