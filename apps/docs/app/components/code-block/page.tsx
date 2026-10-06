import type { Metadata } from 'next'
import { CodeBlockPage } from '../../../components/code-block-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'CodeBlock' }) }

export default function Page() {
  return (
    <CodeBlockPage
      contract={readContract('code-block')}
      sources={{
        default: readExampleSource('code-block/default.tsx'),
        'named-copy': readExampleSource('code-block/named-copy.tsx'),
        'long-line': readExampleSource('code-block/long-line.tsx'),
      }}
    />
  )
}
