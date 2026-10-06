import type { Metadata } from 'next'
import { SectionPage } from '../../../components/section-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Section' }) }

export default function Page() {
  return (
    <SectionPage
      contract={readContract('section')}
      sources={{
        default: readExampleSource('section/default.tsx'),
        sidebar: readExampleSource('section/sidebar.tsx'),
        navigation: readExampleSource('section/navigation.tsx'),
        band: readExampleSource('section/band.tsx'),
      }}
    />
  )
}
