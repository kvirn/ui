import type { Metadata } from 'next'
import { IconUsagePage } from '../../../../components/icon-usage-page.tsx'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: messages.docs.nav.sections.icons }),
}

export default function Page() {
  return <IconUsagePage />
}
