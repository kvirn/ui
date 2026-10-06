import type { Metadata } from 'next'
import { StackPage } from '../../../components/stack-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Stack' }) }

export default function Page() {
  return (
    <StackPage
      contract={readContract('stack')}
      sources={{
        default: readExampleSource('stack/default.tsx'),
        sections: readExampleSource('stack/sections.tsx'),
        gaps: readExampleSource('stack/gaps.tsx'),
        list: readExampleSource('stack/list.tsx'),
        form: readExampleSource('stack/form.tsx'),
      }}
    />
  )
}
