import type { Metadata } from 'next'
import { ContentTypePage } from '../../../components/content-type-page.tsx'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Content page' }) }

export default function Page() {
  return <ContentTypePage slug="content-page" />
}
