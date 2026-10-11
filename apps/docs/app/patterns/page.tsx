import type { Metadata } from 'next'
import { DocsPage } from '../../components/docs-page.tsx'
import { messages } from '../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: messages.docs.nav.sections.patterns }),
}

export default function PatternsPage() {
  return <DocsPage title={messages.docs.nav.sections.patterns} />
}
