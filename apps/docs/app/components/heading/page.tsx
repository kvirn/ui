import type { Metadata } from 'next'
import { HeadingPage } from '../../../components/heading-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Heading' }) }

export default function Page() {
  return (
    <HeadingPage
      contract={readContract('heading')}
      sources={{
        default: readExampleSource('heading/default.tsx'),
        size: readExampleSource('heading/size.tsx'),
        'names-region': readExampleSource('heading/names-region.tsx'),
        'in-prose': readExampleSource('heading/in-prose.tsx'),
        hook: readExampleSource('heading/hook.tsx'),
      }}
    />
  )
}
