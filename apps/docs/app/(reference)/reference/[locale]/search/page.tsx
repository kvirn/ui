import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { referenceSearchMessages } from '../../../../../messages/reference-search.ts'
import { isReferenceLocale } from '../../../../../messages/reference.ts'
import { ReferenceSearchResults } from './search-results.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceSearchMessages[locale].title } : {}
}

// The query is read in the browser (`?q=`), so the page stays static and nothing typed leaves it.
export default async function ReferenceSearchPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  return (
    <Suspense>
      <ReferenceSearchResults locale={locale} />
    </Suspense>
  )
}
