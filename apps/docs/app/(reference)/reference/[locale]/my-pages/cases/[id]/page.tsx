import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceEserviceMessages } from '../../../../../../../messages/reference-eservice.ts'
import { isReferenceLocale } from '../../../../../../../messages/reference.ts'
import { CaseDetailPage } from '../../../my-pages-parts.tsx'

export const generateStaticParams = () =>
  referenceEserviceMessages.en.myPages.cases.map((item) => ({ id: item.id }))

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  if (!isReferenceLocale(locale)) {
    return {}
  }
  const item = referenceEserviceMessages[locale].myPages.cases.find(
    (candidate) => candidate.id === id,
  )
  return item === undefined ? {} : { title: item.title }
}

export default async function ReferenceCaseDetailRoute({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  if (
    !isReferenceLocale(locale) ||
    !referenceEserviceMessages[locale].myPages.cases.some((item) => item.id === id)
  ) {
    notFound()
  }
  return <CaseDetailPage locale={locale} id={id} />
}
