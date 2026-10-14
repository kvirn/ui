import {
  NavTilesHeading,
  NavTilesRoot,
  NavTilesTile,
  PageFrameMain,
  PageToolsCopyLink,
  PageToolsPrint,
  PageToolsRoot,
} from '@kvirn-ui/patterns'
import {
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbRoot,
  Container,
  Heading,
  Link,
  ListItem,
  ListRoot,
  Stack,
} from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  isReferenceLocale,
  referenceLocales,
  referenceMessages,
} from '../../../../../messages/reference.ts'
import { referencePageMessages } from '../../../../../messages/reference-pages.ts'

export const dynamicParams = false

export const generateStaticParams = () =>
  referenceLocales.flatMap((locale) =>
    referenceMessages[locale].chrome.topics.map((topic) => ({ locale, topic: topic.slug })),
  )

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>
}): Promise<Metadata> {
  const { locale, topic: slug } = await params
  if (!isReferenceLocale(locale)) {
    return {}
  }
  const topic = referenceMessages[locale].chrome.topics.find((candidate) => candidate.slug === slug)
  return topic === undefined ? {} : { title: topic.label }
}

// P2, composed from Breadcrumb, NavTiles and PageTools; the Subpage content type is the layout reference.
export default async function ReferenceTopicPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>
}) {
  const { locale, topic: slug } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const topic = referenceMessages[locale].chrome.topics.find((candidate) => candidate.slug === slug)
  if (topic === undefined) {
    notFound()
  }
  const text = referencePageMessages[locale]
  const href = (target: string) => `/reference/${locale}/${target}`
  const tiles = [
    ...topic.groups.map((group) => ({ slug: group.slug, label: group.label })),
    ...topic.links,
  ]
  const shortcuts = topic.groups.flatMap((group) => group.links)
  return (
    <>
      <Container>
        <BreadcrumbRoot label={text.topic.breadcrumbLabel}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/reference/${locale}`}>{text.topic.start}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbCurrent>{topic.label}</BreadcrumbCurrent>
            </BreadcrumbItem>
          </BreadcrumbList>
        </BreadcrumbRoot>
      </Container>
      <PageFrameMain>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{topic.label}</Heading>
            <p className="kv-lead">{text.topicTexts[topic.slug]}</p>
          </Stack>
          <NavTilesRoot>
            {tiles.map((tile) => (
              <NavTilesTile key={tile.slug}>
                <NavTilesHeading href={href(tile.slug)}>{tile.label}</NavTilesHeading>
              </NavTilesTile>
            ))}
          </NavTilesRoot>
          {shortcuts.length > 0 ? (
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                {text.topic.shortcutsHeading}
              </Heading>
              <ListRoot className="kv-list--gap-2">
                {shortcuts.map((link) => (
                  <ListItem key={link.slug}>
                    <Link href={href(link.slug)}>{link.label}</Link>
                  </ListItem>
                ))}
              </ListRoot>
            </Stack>
          ) : null}
          <PageToolsRoot>
            <p className="kv-page-tools-updated">
              {text.topic.lastUpdated} <time dateTime="2026-10-02">{text.topic.updated}</time>
            </p>
            <PageToolsCopyLink>{text.topic.copyLink}</PageToolsCopyLink>
            <PageToolsPrint>{text.topic.print}</PageToolsPrint>
          </PageToolsRoot>
        </Stack>
      </PageFrameMain>
    </>
  )
}
