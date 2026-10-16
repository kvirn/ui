import type { Metadata } from 'next'
import { IconLibraryPage } from '../../../../components/icon-library-page.tsx'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Icons' }) }

export default function Page() {
  return <IconLibraryPage />
}
