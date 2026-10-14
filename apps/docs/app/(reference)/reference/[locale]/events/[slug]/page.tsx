import { PageFrameMain, ServiceLinkLink, ServiceLinkRoot } from '@kvirn-ui/patterns'
import {
  AlertBody,
  AlertTitle,
  AlertWarning,
  DefinitionListDescription,
  DefinitionListRoot,
  DefinitionListRow,
  DefinitionListTerm,
  Heading,
  Prose,
  Stack,
} from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceNewsMessages } from '../../../../../../messages/reference-news.ts'
import { isReferenceLocale, referenceLocales } from '../../../../../../messages/reference.ts'
import { PageBreadcrumb } from '../../contact-parts.tsx'
import { EventTime, PlaceAddress } from '../../news-parts.tsx'

export const dynamicParams = false

export const generateStaticParams = () =>
  referenceLocales.flatMap((locale) =>
    referenceNewsMessages[locale].events.items.map((item) => ({ locale, slug: item.slug })),
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
  const item = referenceNewsMessages[locale].events.items.find(
    (candidate) => candidate.slug === slug,
  )
  return item === undefined ? {} : { title: item.title }
}

// P14 (event), composed from DefinitionList, Alert and ServiceLink; the Event content type is the layout reference.
export default async function ReferenceEventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referenceNewsMessages[locale].events
  const item = text.items.find((candidate) => candidate.slug === slug)
  if (item === undefined) {
    notFound()
  }
  const title = `${item.status === 'cancelled' ? text.cancelledWord : ''}${item.title}`
  return (
    <>
      <PageBreadcrumb
        locale={locale}
        parent={{ href: `/reference/${locale}/events`, label: text.title }}
        current={title}
      />
      <PageFrameMain size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">{title}</Heading>
          {item.status === 'cancelled' ? (
            <AlertWarning>
              <AlertTitle as="p">{text.cancelledTitle}</AlertTitle>
              <AlertBody>
                <p>{text.cancelledBody}</p>
              </AlertBody>
            </AlertWarning>
          ) : null}
          {item.status === 'ended' ? (
            <div className="kv-inset">
              <p>{text.endedBody}</p>
            </div>
          ) : null}
          <DefinitionListRoot>
            <DefinitionListRow>
              <DefinitionListTerm>{text.when}</DefinitionListTerm>
              <DefinitionListDescription>
                <EventTime startsAt={item.startsAt} endsAt={item.endsAt} to={text.to} />
              </DefinitionListDescription>
            </DefinitionListRow>
            <DefinitionListRow>
              <DefinitionListTerm>{text.where}</DefinitionListTerm>
              <DefinitionListDescription>
                <PlaceAddress lines={item.place} />
              </DefinitionListDescription>
            </DefinitionListRow>
            <DefinitionListRow>
              <DefinitionListTerm>{text.cost}</DefinitionListTerm>
              <DefinitionListDescription>{item.cost}</DefinitionListDescription>
            </DefinitionListRow>
            <DefinitionListRow>
              <DefinitionListTerm>{text.accessibility}</DefinitionListTerm>
              <DefinitionListDescription>{item.access}</DefinitionListDescription>
            </DefinitionListRow>
            <DefinitionListRow>
              <DefinitionListTerm>{text.organiser}</DefinitionListTerm>
              <DefinitionListDescription>{item.organiser}</DefinitionListDescription>
            </DefinitionListRow>
          </DefinitionListRoot>
          {item.status === 'upcoming' ? (
            <ServiceLinkRoot>
              <ServiceLinkLink href={`/reference/${locale}/contact`}>{text.book}</ServiceLinkLink>
            </ServiceLinkRoot>
          ) : null}
          <Prose>
            <p>{item.description}</p>
          </Prose>
        </Stack>
      </PageFrameMain>
    </>
  )
}
