import type { Metadata } from 'next'
import { KvirnProviderPage } from '../../../components/kvirn-provider-page.tsx'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'KvirnProvider' }) }

export default function Page() {
  return (
    <KvirnProviderPage exampleSource={readExampleSource('kvirn-provider/language-and-dates.tsx')} />
  )
}
