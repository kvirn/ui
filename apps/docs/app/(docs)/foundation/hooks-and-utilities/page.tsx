import type { Metadata } from 'next'
import { HooksAndUtilitiesPage } from '../../../../components/hooks-and-utilities-page.tsx'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: messages.docs.nav.hooksAndUtilities }),
}

export default function Page() {
  return <HooksAndUtilitiesPage />
}
