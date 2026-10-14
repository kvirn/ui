'use client'

import {
  Breadcrumb,
  Container,
  Heading,
  Link,
  List,
  Pagination,
  Stack,
  useFormat,
} from '@kvirn-ui/react'
import { kvirnbyNews } from '../../fixtures/news-events-and-notices.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { NewsDate } from './news-date.tsx'

export interface NewsListProps {
  /** `first` and `last` are the two ends of the pagination; `empty` has no news. Default `first`. */
  page?: 'first' | 'last' | 'empty' | undefined
}

const totalItems = 23
const totalPages = 3
const itemsPerPage = 10

/**
 * The news archive, the slot between header and footer: breadcrumb, `h1`, the count, the news list
 * and the pagination. Example text is English and fictional (Kvirnby municipality).
 */
export function NewsList({ page = 'first' }: NewsListProps) {
  const format = useFormat()
  const currentPage = page === 'last' ? totalPages : 1
  const items = page === 'last' ? kvirnbyNews.slice(0, totalItems - itemsPerPage * 2) : kvirnbyNews
  const firstShown = (currentPage - 1) * itemsPerPage + 1
  const lastShown = firstShown + items.length - 1
  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>News</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">News</Heading>
          {page === 'empty' ? (
            <div className="kv-empty-state">
              <Heading as="h2" size="heading-3" className="kv-empty-state-title">
                There is no news yet
              </Heading>
              <p className="kv-empty-state-body">
                New items appear here when they are published. In the meantime, read about{' '}
                <Link.Root href="#about">what is happening in Kvirnby</Link.Root>.
              </p>
            </div>
          ) : (
            <>
              <p>
                Showing {format.number(firstShown)}–{format.number(lastShown)} of{' '}
                {format.number(totalItems)} news items, newest first.
              </p>
              <List.Root className="kv-list--gap-8">
                {items.map((item) => (
                  <List.Item key={item.href}>
                    <Stack className="kv-stack--gap-2">
                      <Heading as="h2" size="heading-4">
                        <Link.Root href={item.href}>{item.title}</Link.Root>
                      </Heading>
                      <p>
                        <NewsDate isoDate={item.publishedOn} />
                      </p>
                      <p>{item.summary}</p>
                    </Stack>
                  </List.Item>
                ))}
              </List.Root>
              <Pagination.Root>
                <Pagination.List>
                  {currentPage > 1 ? (
                    <Pagination.Item>
                      <Pagination.Previous href={`?page=${currentPage - 1}`} />
                    </Pagination.Item>
                  ) : null}
                  {[1, 2, 3].map((number) => (
                    <Pagination.Item key={number}>
                      <Pagination.Link
                        page={number}
                        href={`?page=${number}`}
                        current={number === currentPage}
                      />
                    </Pagination.Item>
                  ))}
                  <Pagination.Item>
                    <Pagination.Status page={currentPage} total={totalPages} />
                  </Pagination.Item>
                  {currentPage < totalPages ? (
                    <Pagination.Item>
                      <Pagination.Next href={`?page=${currentPage + 1}`} />
                    </Pagination.Item>
                  ) : null}
                </Pagination.List>
              </Pagination.Root>
            </>
          )}
        </Stack>
      </PageFrame.Main>
    </>
  )
}
