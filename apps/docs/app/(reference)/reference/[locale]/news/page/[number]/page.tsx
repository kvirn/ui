import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceNewsMessages } from '../../../../../../../messages/reference-news.ts'
import { isReferenceLocale, referenceLocales } from '../../../../../../../messages/reference.ts'
import { NewsListView, newsPageCount } from '../../../news-views.tsx'

export const dynamicParams = false

export const generateStaticParams = () =>
  referenceLocales.flatMap((locale) =>
    Array.from({ length: newsPageCount(locale) - 1 }, (_, index) => ({
      locale,
      number: String(index + 2),
    })),
  )

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; number: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceNewsMessages[locale].news.title } : {}
}

export default async function ReferenceNewsPageNumber({
  params,
}: {
  params: Promise<{ locale: string; number: string }>
}) {
  const { locale, number } = await params
  const page = Number(number)
  if (
    !isReferenceLocale(locale) ||
    !Number.isInteger(page) ||
    page < 2 ||
    page > newsPageCount(locale)
  ) {
    notFound()
  }
  return <NewsListView locale={locale} page={page} />
}
