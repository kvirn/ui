import type { Metadata } from 'next'
import { isReferenceLocale, referenceMessages } from '../../../../../messages/reference.ts'
import { ReferenceStatus } from '../reference-status.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale)
    ? { title: referenceMessages[locale].serviceUnavailable.title }
    : {}
}

export default async function ServiceUnavailablePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <ReferenceStatus
      locale={isReferenceLocale(locale) ? locale : 'sv'}
      status="service-unavailable"
    />
  )
}
