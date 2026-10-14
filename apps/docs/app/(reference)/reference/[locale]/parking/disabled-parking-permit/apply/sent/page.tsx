import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceEserviceMessages } from '../../../../../../../../messages/reference-eservice.ts'
import { isReferenceLocale } from '../../../../../../../../messages/reference.ts'
import { SentPage } from '../apply-parts.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale)
    ? { title: referenceEserviceMessages[locale].apply.sent.title }
    : {}
}

export default async function ReferenceApplySentPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  return <SentPage locale={locale} />
}
