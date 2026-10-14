import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceStatementMessages } from '../../../../../../messages/reference-statement.ts'
import { isReferenceLocale } from '../../../../../../messages/reference.ts'
import { FeedbackForm } from './feedback-form.tsx'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceStatementMessages[locale].form.title } : {}
}

export default async function ReferenceFeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  return <FeedbackForm locale={locale} />
}
