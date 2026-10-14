import { PageFrameMain } from '@kvirn-ui/patterns'
import {
  Heading,
  Link,
  ListItem,
  ListRoot,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
  PaginationStatus,
  Stack,
} from '@kvirn-ui/react'
import { referenceNewsMessages } from '../../../../messages/reference-news.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'
import { PageBreadcrumb } from './contact-parts.tsx'
import { FormattedDate, ResultCount } from './news-parts.tsx'

export const newsPageCount = (locale: ReferenceLocale) =>
  Math.ceil(
    referenceNewsMessages[locale].news.items.length / referenceNewsMessages[locale].news.perPage,
  )

export function NewsListView({ locale, page }: { locale: ReferenceLocale; page: number }) {
  const text = referenceNewsMessages[locale].news
  const totalPages = newsPageCount(locale)
  const first = (page - 1) * text.perPage
  const items = text.items.slice(first, first + text.perPage)
  const pageHref = (number: number) =>
    number === 1 ? `/reference/${locale}/news` : `/reference/${locale}/news/page/${number}`
  return (
    <>
      <PageBreadcrumb locale={locale} current={text.title} />
      <PageFrameMain size="reading">
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{text.title}</Heading>
            <p className="kv-lead">{text.lead}</p>
          </Stack>
          <ResultCount
            from={first + 1}
            to={first + items.length}
            total={text.items.length}
            locale={locale}
          />
          <ListRoot className="kv-list--gap-8">
            {items.map((item) => (
              <ListItem key={item.slug}>
                <Stack className="kv-stack--gap-2">
                  <Heading as="h2" size="heading-4">
                    <Link href={`/reference/${locale}/news/${item.slug}`}>{item.title}</Link>
                  </Heading>
                  <p>
                    <FormattedDate isoDate={item.publishedOn} />
                  </p>
                  <p>{item.summary}</p>
                </Stack>
              </ListItem>
            ))}
          </ListRoot>
          <PaginationRoot label={text.pagination}>
            <PaginationList>
              {page > 1 ? (
                <PaginationItem>
                  <PaginationPrevious href={pageHref(page - 1)} />
                </PaginationItem>
              ) : null}
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                <PaginationItem key={number}>
                  <PaginationLink page={number} href={pageHref(number)} current={number === page} />
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationStatus page={page} total={totalPages} />
              </PaginationItem>
              {page < totalPages ? (
                <PaginationItem>
                  <PaginationNext href={pageHref(page + 1)} />
                </PaginationItem>
              ) : null}
            </PaginationList>
          </PaginationRoot>
        </Stack>
      </PageFrameMain>
    </>
  )
}
