'use client'
import { useParams } from 'next/navigation'
import { isReferenceLocale } from '../../../../messages/reference.ts'
import { ReferenceStatus } from './reference-status.tsx'

export default function ReferenceNotFound() {
  const { locale } = useParams<{ locale: string }>()
  return <ReferenceStatus locale={isReferenceLocale(locale) ? locale : 'sv'} status="not-found" />
}
