import type { Metadata } from 'next'
import { LocalesPage } from '../../../components/locales-page.tsx'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: 'Locales and strings' }),
}

export default function Page() {
  return (
    <LocalesPage
      sources={{
        formatting: readExampleSource('locales/formatting.tsx'),
        instanceMessages: readExampleSource('locales/instance-messages.tsx'),
      }}
    />
  )
}
