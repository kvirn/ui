import {
  Address,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbRoot,
  Container,
  DefinitionListDescription,
  DefinitionListRoot,
  DefinitionListRow,
  DefinitionListTerm,
  Heading,
  Link,
  Stack,
} from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { referenceContactMessages } from '../../../../messages/reference-contact.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'

export function PageBreadcrumb({
  locale,
  parent,
  current,
}: {
  locale: ReferenceLocale
  parent?: { href: string; label: string } | undefined
  current: string
}) {
  const text = referenceContactMessages[locale]
  return (
    <Container>
      <BreadcrumbRoot label={text.breadcrumb}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/reference/${locale}`}>{text.start}</BreadcrumbLink>
          </BreadcrumbItem>
          {parent ? (
            <BreadcrumbItem>
              <BreadcrumbLink href={parent.href}>{parent.label}</BreadcrumbLink>
            </BreadcrumbItem>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbCurrent>{current}</BreadcrumbCurrent>
          </BreadcrumbItem>
        </BreadcrumbList>
      </BreadcrumbRoot>
    </Container>
  )
}

export function OpeningHours({
  locale,
  hours,
  children,
}: {
  locale: ReferenceLocale
  hours: readonly { days: string; time: string | undefined }[]
  children?: ReactNode
}) {
  const text = referenceContactMessages[locale]
  return (
    <Stack className="kv-stack--gap-4">
      <Heading as="h2" size="heading-3">
        {text.openingHours}
      </Heading>
      <DefinitionListRoot>
        {hours.map((row) => (
          <DefinitionListRow key={row.days}>
            <DefinitionListTerm>{row.days}</DefinitionListTerm>
            <DefinitionListDescription>{row.time ?? text.closed}</DefinitionListDescription>
          </DefinitionListRow>
        ))}
      </DefinitionListRoot>
      {children}
    </Stack>
  )
}

export function AddressAndVisit({
  locale,
  address,
  place,
  mapsHref,
  access,
}: {
  locale: ReferenceLocale
  address: readonly string[]
  place: string
  mapsHref: string
  access: readonly { term: string; value: string }[]
}) {
  const text = referenceContactMessages[locale]
  return (
    <Stack className="kv-stack--gap-4">
      <Heading as="h2" size="heading-3">
        {text.visitUs}
      </Heading>
      <Address>
        {address.map((line, index) => (
          <span key={line}>
            {index > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </Address>
      <p>
        <Link href={mapsHref}>{text.directions({ place })}</Link>
      </p>
      <DefinitionListRoot>
        {access.map((row) => (
          <DefinitionListRow key={row.term}>
            <DefinitionListTerm>{row.term}</DefinitionListTerm>
            <DefinitionListDescription>{row.value}</DefinitionListDescription>
          </DefinitionListRow>
        ))}
      </DefinitionListRoot>
    </Stack>
  )
}
