import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceNewsMessages } from '../../../../../messages/reference-news.ts'
import { isReferenceLocale } from '../../../../../messages/reference.ts'
import { NewsListView } from '../news-views.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceNewsMessages[locale].news.title } : {}
}

export default async function ReferenceNewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  return <NewsListView locale={locale} page={1} />
}
