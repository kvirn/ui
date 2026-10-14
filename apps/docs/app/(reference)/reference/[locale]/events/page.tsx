import { PageFrameMain } from '@kvirn-ui/patterns'
import { Heading, Link, ListItem, ListRoot, Stack } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceNewsMessages } from '../../../../../messages/reference-news.ts'
import { isReferenceLocale } from '../../../../../messages/reference.ts'
import { PageBreadcrumb } from '../contact-parts.tsx'
import { EventTime } from '../news-parts.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceNewsMessages[locale].events.title } : {}
}

// P14 (list), composed from Breadcrumb, List and EventTime; the Event list content type is the layout reference.
export default async function ReferenceEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referenceNewsMessages[locale].events
  const groups = [
    { heading: text.upcoming, items: text.items.filter((item) => item.status !== 'ended') },
    { heading: text.past, items: text.items.filter((item) => item.status === 'ended') },
  ]
  return (
    <>
      <PageBreadcrumb locale={locale} current={text.title} />
      <PageFrameMain size="reading">
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{text.title}</Heading>
            <p className="kv-lead">{text.lead}</p>
          </Stack>
          {groups.map((group) => (
            <Stack key={group.heading} className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                {group.heading}
              </Heading>
              <ListRoot className="kv-list--gap-8">
                {group.items.map((item) => (
                  <ListItem key={item.slug}>
                    <Stack className="kv-stack--gap-2">
                      <Heading as="h3" size="heading-4">
                        <Link href={`/reference/${locale}/events/${item.slug}`}>
                          {item.status === 'cancelled' ? text.cancelledWord : ''}
                          {item.title}
                        </Link>
                      </Heading>
                      <p>
                        <EventTime startsAt={item.startsAt} endsAt={item.endsAt} to={text.to} />
                      </p>
                      <p>{item.summary}</p>
                    </Stack>
                  </ListItem>
                ))}
              </ListRoot>
            </Stack>
          ))}
        </Stack>
      </PageFrameMain>
    </>
  )
}
