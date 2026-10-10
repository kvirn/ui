import type { Metadata } from 'next'
import { KvirnProviderPage } from '../../../components/kvirn-provider-page.tsx'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'KvirnProvider' }) }

export default function Page() {
  return <KvirnProviderPage />
}
