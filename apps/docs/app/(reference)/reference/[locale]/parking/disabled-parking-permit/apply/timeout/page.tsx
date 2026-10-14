import { PageFrameMain } from '@kvirn-ui/patterns'
import { AlertBody, AlertInfo, Heading, LinkRoot, Stack } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceEserviceMessages } from '../../../../../../../../messages/reference-eservice.ts'
import { isReferenceLocale } from '../../../../../../../../messages/reference.ts'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceEserviceMessages[locale].timeout.title } : {}
}

// P9 after expiry, a T6 status page in the T4 layout: it says the answers are kept (they are, in sessionStorage).
export default async function ReferenceApplyTimeoutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referenceEserviceMessages[locale].timeout
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <PageFrameMain size="form">
      <Stack className="kv-stack--gap-8">
        <Stack className="kv-stack--gap-4">
          <Heading as="h1">{text.heading}</Heading>
          <p className="kv-lead">{text.lead}</p>
        </Stack>
        <AlertInfo>
          <AlertBody>
            <p>{text.kept}</p>
          </AlertBody>
        </AlertInfo>
        <p>
          <LinkRoot href={href('parking/disabled-parking-permit/sign-in')}>
            {text.signInAgain}
          </LinkRoot>
        </p>
        <p>
          <LinkRoot href={href('')}>{text.toStart}</LinkRoot>
        </p>
      </Stack>
    </PageFrameMain>
  )
}
