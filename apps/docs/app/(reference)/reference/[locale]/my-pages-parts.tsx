'use client'
import { PageFrame } from '@kvirn-ui/patterns'
import { Badge, Card, DefinitionList, Grid, Heading, Link, Stack, useFormat } from '@kvirn-ui/react'
import { referenceEserviceMessages } from '../../../../messages/reference-eservice.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'
import { PageBreadcrumb } from './contact-parts.tsx'

const badgeVariants = { received: 'info', 'in-progress': 'info', decided: 'success' } as const

function CaseFacts({
  locale,
  item,
}: {
  locale: ReferenceLocale
  item: (typeof referenceEserviceMessages)['en']['myPages']['cases'][number]
}) {
  const text = referenceEserviceMessages[locale].myPages
  const format = useFormat()
  const date = (isoDate: string) => (
    <time dateTime={isoDate}>
      {format.date(new Date(isoDate), { dateStyle: 'long', timeZone: 'UTC' })}
    </time>
  )
  return (
    <DefinitionList.Root>
      <DefinitionList.Row>
        <DefinitionList.Term>{text.caseNumber}</DefinitionList.Term>
        <DefinitionList.Description>{item.number}</DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{text.sent}</DefinitionList.Term>
        <DefinitionList.Description>{date(item.sent)}</DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{text.lastChange}</DefinitionList.Term>
        <DefinitionList.Description>{date(item.lastChange)}</DefinitionList.Description>
      </DefinitionList.Row>
    </DefinitionList.Root>
  )
}

// P10, composed from the S12 Case card recipe. T1: the signed-in view is part of the site.
export function MyPagesPage({ locale }: { locale: ReferenceLocale }) {
  const text = referenceEserviceMessages[locale].myPages
  return (
    <>
      <PageBreadcrumb locale={locale} current={text.title} />
      <PageFrame.Main>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{text.heading}</Heading>
            <p className="kv-lead">{text.lead}</p>
          </Stack>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              {text.casesHeading}
            </Heading>
            <Grid.Root as="ul" className="kv-grid--cols-1">
              {text.cases.map((item) => (
                <Card.Root as="li" key={item.id}>
                  <Card.Body className="kv-prose">
                    <Heading as="h3" size="heading-4">
                      <Link.Root href={`/reference/${locale}/my-pages/cases/${item.id}`}>
                        {item.title}
                      </Link.Root>
                    </Heading>
                    <p>
                      <Badge variant={badgeVariants[item.status]}>
                        {text.statuses[item.status]}
                      </Badge>
                    </p>
                    <p>{item.nextStep}</p>
                    <CaseFacts locale={locale} item={item} />
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid.Root>
          </Stack>
        </Stack>
      </PageFrame.Main>
    </>
  )
}

// P11, T1 with the breadcrumb through My pages.
export function CaseDetailPage({ locale, id }: { locale: ReferenceLocale; id: string }) {
  const text = referenceEserviceMessages[locale].myPages
  const item = text.cases.find((candidate) => candidate.id === id)
  if (item === undefined) {
    return null
  }
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <>
      <PageBreadcrumb
        locale={locale}
        parent={{ href: href('my-pages'), label: text.title }}
        current={item.title}
      />
      <PageFrame.Main>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{item.title}</Heading>
            <p>
              <Badge variant={badgeVariants[item.status]}>{text.statuses[item.status]}</Badge>
            </p>
          </Stack>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              {text.nextStep}
            </Heading>
            <p>{item.nextStep}</p>
          </Stack>
          <CaseFacts locale={locale} item={item} />
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              {text.contactHeading}
            </Heading>
            <p>
              {text.contactBody} <Link.Root href={href('contact')}>{text.contact}</Link.Root>
            </p>
          </Stack>
          <p>
            <Link.Root href={href('my-pages')}>{text.toMyPages}</Link.Root>
          </p>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
