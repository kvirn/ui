import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceContentMessages } from '../../../../../messages/reference-content.ts'
import { isReferenceLocale } from '../../../../../messages/reference.ts'
import { PrivacyPage } from '../content-pages.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceContentMessages[locale].privacy.title } : {}
}

export default async function ReferencePrivacyRoute({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  return <PrivacyPage locale={locale} />
}
