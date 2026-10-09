import type { Metadata } from 'next'
import { PageHeading } from '../../components/page-heading.tsx'
import { messages } from '../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: messages.docs.nav.sections.contentTypes }),
}

export default function ContentTypesPage() {
  return <PageHeading>{messages.docs.nav.sections.contentTypes}</PageHeading>
}
