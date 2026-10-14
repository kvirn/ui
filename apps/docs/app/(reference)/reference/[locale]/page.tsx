import {
  HeroHeading,
  HeroImage,
  HeroLead,
  HeroRoot,
  NavTilesHeading,
  NavTilesRoot,
  NavTilesText,
  NavTilesTile,
  PageFrameMain,
} from '@kvirn-ui/patterns'
import { kvirnbyHills } from '@kvirn-ui/patterns/fixtures'
import { Container, GridRoot, Heading, Link, Section, Stack } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isReferenceLocale, referenceMessages } from '../../../../messages/reference.ts'
import { popularServiceSlugs, referencePageMessages } from '../../../../messages/reference-pages.ts'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referencePageMessages[locale].start.title } : {}
}

// P1, composed from Hero and NavTiles the way an adopter would; the Start page content type is the layout reference.
export default async function ReferenceStartPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referencePageMessages[locale]
  const { topics } = referenceMessages[locale].chrome
  const href = (slug: string) => `/reference/${locale}/${slug}`
  const links = topics.flatMap((topic) => [
    ...topic.groups.flatMap((group) => group.links),
    ...topic.links,
  ])
  const popular = popularServiceSlugs.flatMap((slug) => {
    const link = links.find((candidate) => candidate.slug === slug)
    return link === undefined ? [] : [link]
  })
  return (
    <PageFrameMain bleed>
      <HeroRoot>
        <HeroHeading>{text.start.heading}</HeroHeading>
        <HeroLead>{text.start.lead}</HeroLead>
        <HeroImage src={kvirnbyHills} alt="" />
      </HeroRoot>
      <Section className="kv-section--padding-lg">
        <Container>
          <Stack className="kv-stack--gap-8">
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-2">
                {text.start.popularHeading}
              </Heading>
              <GridRoot className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
                {popular.map((link) => (
                  <li key={link.slug}>
                    <Link href={href(link.slug)}>{link.label}</Link>
                  </li>
                ))}
              </GridRoot>
            </Stack>
            <Stack>
              <Heading as="h2" size="heading-2">
                {text.start.topicsHeading}
              </Heading>
              <NavTilesRoot>
                {topics.map((topic) => (
                  <NavTilesTile key={topic.slug}>
                    <NavTilesHeading level="h3" href={href(topic.slug)}>
                      {topic.label}
                    </NavTilesHeading>
                    <NavTilesText>{text.topicTexts[topic.slug]}</NavTilesText>
                  </NavTilesTile>
                ))}
              </NavTilesRoot>
            </Stack>
          </Stack>
        </Container>
      </Section>
    </PageFrameMain>
  )
}
