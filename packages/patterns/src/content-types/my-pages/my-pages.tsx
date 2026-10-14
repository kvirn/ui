'use client'

import {
  Breadcrumb,
  Container,
  Grid,
  Heading,
  Pagination,
  Progress,
  Stack,
  useFormat,
} from '@kvirn-ui/react'
import { kvirnbyCases } from '../../fixtures/my-pages.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { ServiceLink } from '../../navigation-and-promotion/service-link/service-link.tsx'
import { CaseCard } from './case-card.tsx'

export interface MyPagesProps {
  /**
   * `several` lists the cases by last change; `action-needed-first` lifts the case that waits for
   * the resident; `no-cases` shows the empty state; `loading` shows the wait. Default `several`.
   */
  state?: 'several' | 'action-needed-first' | 'no-cases' | 'loading' | undefined
}

const totalCases = 12
const totalPages = 3

/**
 * The resident's case list, the slot between header and footer: breadcrumb, `h1`, `h2` "Your
 * cases", the count, one Case card per case in one column, and the pagination. Example text is
 * English and fictional (Kvirnby municipality).
 */
export function MyPages({ state = 'several' }: MyPagesProps) {
  const format = useFormat()
  const cases =
    state === 'action-needed-first'
      ? [...kvirnbyCases].sort(
          (first, second) =>
            Number(second.status === 'action-needed') - Number(first.status === 'action-needed'),
        )
      : [...kvirnbyCases].sort((first, second) => second.lastChange.localeCompare(first.lastChange))
  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>My pages</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">My pages</Heading>
          <Heading as="h2" size="heading-3">
            Your cases
          </Heading>
          {state === 'loading' ? (
            <Progress.Root label="Fetching your cases.">
              <Progress.Indicator />
              <Progress.Label />
            </Progress.Root>
          ) : state === 'no-cases' ? (
            <div className="kv-empty-state">
              <Heading as="h3" size="heading-4" className="kv-empty-state-title">
                You have no cases yet
              </Heading>
              <p className="kv-empty-state-body">
                Cases you send in with an e-service appear here, with where they stand.
              </p>
              <ServiceLink.Root>
                <ServiceLink.Link href="#services">Find an e-service</ServiceLink.Link>
              </ServiceLink.Root>
            </div>
          ) : (
            <>
              <p>
                Showing {format.number(1)}–{format.number(cases.length)} of{' '}
                {format.number(totalCases)} cases.
              </p>
              <Grid.Root as="ul" className="kv-grid--cols-1">
                {cases.map((item) => (
                  <CaseCard key={item.number} item={item} />
                ))}
              </Grid.Root>
              <Pagination.Root>
                <Pagination.List>
                  {[1, 2, 3].map((number) => (
                    <Pagination.Item key={number}>
                      <Pagination.Link
                        page={number}
                        href={`?page=${number}`}
                        current={number === 1}
                      />
                    </Pagination.Item>
                  ))}
                  <Pagination.Item>
                    <Pagination.Status page={1} total={totalPages} />
                  </Pagination.Item>
                  <Pagination.Item>
                    <Pagination.Next href="?page=2" />
                  </Pagination.Item>
                </Pagination.List>
              </Pagination.Root>
            </>
          )}
        </Stack>
      </PageFrame.Main>
    </>
  )
}
