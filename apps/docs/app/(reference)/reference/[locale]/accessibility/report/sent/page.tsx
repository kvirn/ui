import { PageFrameMain } from '@kvirn-ui/patterns'
import { AlertBody, AlertSuccess, AlertTitle, Heading, Link, Stack } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceStatementMessages } from '../../../../../../../messages/reference-statement.ts'
import { isReferenceLocale } from '../../../../../../../messages/reference.ts'
import { ReferenceNumber } from './reference-number.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceStatementMessages[locale].sent.title } : {}
}

export default async function ReferenceFeedbackSentPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referenceStatementMessages[locale].sent
  return (
    <PageFrameMain size="form">
      <Stack className="kv-stack--gap-8">
        <Heading as="h1">{text.heading}</Heading>
        <AlertSuccess>
          <AlertTitle as="h2">{text.alertTitle}</AlertTitle>
          <AlertBody>
            <ReferenceNumber
              label={text.reference}
              number={text.referenceNumber}
              copy={text.copy}
            />
          </AlertBody>
        </AlertSuccess>
        <Stack className="kv-stack--gap-4">
          <Heading as="h2" size="heading-3">
            {text.nextHeading}
          </Heading>
          <p>{text.nextBody}</p>
          <p>{text.nothingSent}</p>
        </Stack>
        <p>
          <Link href={`/reference/${locale}`}>{text.backToStart}</Link>
        </p>
      </Stack>
    </PageFrameMain>
  )
}
