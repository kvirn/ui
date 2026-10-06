'use client'
import { Pagination } from '@kvirn-ui/react'

export function DefaultPagination() {
  return (
    <Pagination.Root>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous href="#page-1" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={1} href="#page-1" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={2} href="#page-2" current />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link page={3} href="#page-3" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Status page={2} total={3} />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next href="#page-3" />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  )
}
