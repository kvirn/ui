import { PageFrameMain } from '@kvirn-ui/patterns'
import {
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
import { referenceContactMessages } from '../../../../../../messages/reference-contact.ts'
import { isReferenceLocale } from '../../../../../../messages/reference.ts'
import { AddressAndVisit, OpeningHours, PageBreadcrumb } from '../../contact-parts.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceContactMessages[locale].unit.title } : {}
}

export default async function ReferencePreschoolUnitPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const common = referenceContactMessages[locale]
  const text = common.unit
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <>
      <PageBreadcrumb
        locale={locale}
        parent={{ href: href('preschool'), label: text.preschool }}
        current={text.title}
      />
      <PageFrameMain>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{text.title}</Heading>
            <p className="kv-lead">{text.lead}</p>
          </Stack>
          <div className="kv-prose">
            <Heading as="h2" size="heading-3">
              {text.aboutHeading}
            </Heading>
            <p>{text.about}</p>
          </div>
          <OpeningHours locale={locale} hours={text.hours} />
          <AddressAndVisit
            locale={locale}
            address={text.address}
            place={text.title}
            mapsHref="https://maps.example/hillside-preschool"
            access={text.access}
          />
          <CardRoot>
            <CardBody className="kv-prose">
              <Heading as="h2" size="heading-3">
                {text.contactHeading}
              </Heading>
              <p>{text.contactRole}</p>
              <DefinitionListRoot>
                <DefinitionListRow>
                  <DefinitionListTerm>{common.phone}</DefinitionListTerm>
                  <DefinitionListDescription>
                    <Link href="tel:+46000000002">{text.phoneNumber}</Link>
                  </DefinitionListDescription>
                </DefinitionListRow>
                <DefinitionListRow>
                  <DefinitionListTerm>{common.email}</DefinitionListTerm>
                  <DefinitionListDescription>
                    <Link href="mailto:hillside@kvirnby.example">hillside@kvirnby.example</Link>
                  </DefinitionListDescription>
                </DefinitionListRow>
              </DefinitionListRoot>
            </CardBody>
          </CardRoot>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              {text.relatedHeading}
            </Heading>
            <ListRoot className="kv-list--gap-2">
              {text.related.map((link) => (
                <ListItem key={link.label}>
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
