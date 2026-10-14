import { PageFrameMain, ServiceLinkLink, ServiceLinkRoot } from '@kvirn-ui/patterns'
import { Heading, Link, ListItem, ListRoot, Stack } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceEserviceMessages } from '../../../../../../messages/reference-eservice.ts'
import { isReferenceLocale, referenceMessages } from '../../../../../../messages/reference.ts'
import { PageBreadcrumb } from '../../contact-parts.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceEserviceMessages[locale].start.title } : {}
}

// P4, composed from ServiceLink and prose parts; the E-service start content type is the layout reference.
export default async function ReferenceDisabledParkingPermitPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referenceEserviceMessages[locale].start
  const topic = referenceMessages[locale].chrome.topics.find(
    (candidate) => candidate.slug === 'transport-and-parking',
  )
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <>
      <PageBreadcrumb
        locale={locale}
        parent={topic === undefined ? undefined : { href: href(topic.slug), label: topic.label }}
        current={text.title}
      />
      <PageFrameMain>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{text.heading}</Heading>
            <p className="kv-lead">{text.lead}</p>
          </Stack>
          <ServiceLinkRoot>
            <ServiceLinkLink href={href('parking/disabled-parking-permit/sign-in')}>
              {text.action}
            </ServiceLinkLink>
          </ServiceLinkRoot>
          <Stack className="kv-stack--gap-4 kv-prose">
            <Heading as="h2" size="heading-3">
              {text.whoHeading}
            </Heading>
            <p>{text.whoBody}</p>
            <Heading as="h2" size="heading-3">
              {text.needHeading}
            </Heading>
            <ListRoot className="kv-list--gap-2">
              {text.need.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </ListRoot>
            <Heading as="h2" size="heading-3">
              {text.timeHeading}
            </Heading>
            <p>{text.timeBody}</p>
            <Heading as="h2" size="heading-3">
              {text.costHeading}
            </Heading>
            <p>{text.costBody}</p>
            <Heading as="h2" size="heading-3">
              {text.helpHeading}
            </Heading>
            <p>
              {text.helpBody} <Link href={href('contact')}>{text.contact}</Link>
            </p>
          </Stack>
        </Stack>
      </PageFrameMain>
    </>
  )
}
