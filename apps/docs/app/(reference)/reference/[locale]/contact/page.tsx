import { PageFrameMain, ServiceLinkLink, ServiceLinkRoot } from '@kvirn-ui/patterns'
import {
  AlertBody,
  AlertInfo,
  AlertTitle,
  CardBody,
  CardRoot,
  DefinitionListDescription,
  DefinitionListRoot,
  DefinitionListRow,
  DefinitionListTerm,
  Heading,
  Link,
  ListItem,
  ListRoot,
  Stack,
} from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceContactMessages } from '../../../../../messages/reference-contact.ts'
import { isReferenceLocale } from '../../../../../messages/reference.ts'
import { AddressAndVisit, OpeningHours, PageBreadcrumb } from '../contact-parts.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceContactMessages[locale].contact.title } : {}
}

export default async function ReferenceContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const common = referenceContactMessages[locale]
  const text = common.contact
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <>
      <PageBreadcrumb locale={locale} current={text.title} />
      <PageFrameMain>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{text.heading}</Heading>
            <p className="kv-lead">{text.lead}</p>
          </Stack>
          <CardRoot>
            <CardBody className="kv-prose">
              <Heading as="h2" size="heading-3">
                {text.centre}
              </Heading>
              <DefinitionListRoot>
                <DefinitionListRow>
                  <DefinitionListTerm>{common.phone}</DefinitionListTerm>
                  <DefinitionListDescription>
                    <Link href="tel:+46000000000">{text.phoneNumber}</Link>
                  </DefinitionListDescription>
                </DefinitionListRow>
                <DefinitionListRow>
                  <DefinitionListTerm>{common.email}</DefinitionListTerm>
                  <DefinitionListDescription>
                    <Link href="mailto:contact@kvirnby.example">contact@kvirnby.example</Link>
                  </DefinitionListDescription>
                </DefinitionListRow>
              </DefinitionListRoot>
            </CardBody>
          </CardRoot>
          <OpeningHours locale={locale} hours={text.hours}>
            <AlertInfo>
              <AlertTitle as="p">{text.holidayTitle}</AlertTitle>
              <AlertBody>
                <p>{text.holidayBody}</p>
              </AlertBody>
            </AlertInfo>
          </OpeningHours>
          <AddressAndVisit
            locale={locale}
            address={text.address}
            place={text.place}
            mapsHref="https://maps.example/kvirnby-town-hall"
            access={text.access}
          />
          <ServiceLinkRoot>
            <ServiceLinkLink href={href('parking/disabled-parking-permit')}>
              {text.parkingPermit}
            </ServiceLinkLink>
          </ServiceLinkRoot>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              {text.otherWays}
            </Heading>
            <ListRoot className="kv-list--gap-2">
              {text.otherLinks.map((link) => (
                <ListItem key={link.slug}>
                  <Link href={href(link.slug)}>{link.label}</Link>
                </ListItem>
              ))}
            </ListRoot>
          </Stack>
        </Stack>
      </PageFrameMain>
    </>
  )
}
