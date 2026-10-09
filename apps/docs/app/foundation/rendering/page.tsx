import type { Metadata } from 'next'
import { RenderingPage } from '../../../components/rendering-page.tsx'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: 'Rendering: server and client' }),
}

export default function Page() {
  return <RenderingPage />
}
