import { PageFrameMain, PageToolsCopyLink, PageToolsPrint, PageToolsRoot } from '@kvirn-ui/patterns'
import { Heading, Link, ListItem, ListRoot, Prose, Stack } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceNewsMessages } from '../../../../../../messages/reference-news.ts'
import { referencePageMessages } from '../../../../../../messages/reference-pages.ts'
import { isReferenceLocale, referenceLocales } from '../../../../../../messages/reference.ts'
import { PageBreadcrumb } from '../../contact-parts.tsx'
import { FormattedDate } from '../../news-parts.tsx'

export const dynamicParams = false

export const generateStaticParams = () =>
  referenceLocales.flatMap((locale) =>
    referenceNewsMessages[locale].news.items.map((item) => ({ locale, slug: item.slug })),
  )

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isReferenceLocale(locale)) {
    return {}
  }
  const item = referenceNewsMessages[locale].news.items.find((candidate) => candidate.slug === slug)
  return item === undefined ? {} : { title: item.title }
}

// P13, composed from Breadcrumb, Prose and PageTools; the News article content type is the layout reference.
export default async function ReferenceNewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referenceNewsMessages[locale].news
  const item = text.items.find((candidate) => candidate.slug === slug)
  if (item === undefined) {
    notFound()
  }
  const related = text.items.filter((candidate) => candidate.slug !== slug).slice(0, 2)
  const topic = referencePageMessages[locale].topic
  return (
    <>
      <PageBreadcrumb
        locale={locale}
        parent={{ href: `/reference/${locale}/news`, label: text.title }}
        current={item.title}
      />
      <PageFrameMain size="reading">
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-2">
            <Heading as="h1">{item.title}</Heading>
            <p>
              {text.published} <FormattedDate isoDate={item.publishedOn} />
              {item.updatedOn === undefined ? null : (
                <>
                  . {text.updated} <FormattedDate isoDate={item.updatedOn} />
                </>
              )}
            </p>
          </Stack>
          <p className="kv-lead">{item.summary}</p>
          <Prose>
            {item.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Prose>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              {text.related}
            </Heading>
            <ListRoot className="kv-list--gap-2">
              {related.map((link) => (
                <ListItem key={link.slug}>
                  <Link href={`/reference/${locale}/news/${link.slug}`}>{link.title}</Link>
                </ListItem>
              ))}
            </ListRoot>
          </Stack>
          <PageToolsRoot>
            <PageToolsCopyLink>{topic.copyLink}</PageToolsCopyLink>
            <PageToolsPrint>{topic.print}</PageToolsPrint>
          </PageToolsRoot>
        </Stack>
      </PageFrameMain>
    </>
  )
}
