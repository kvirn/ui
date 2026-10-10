import type { Metadata } from 'next'
import { ProsePage } from '../../../components/prose-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Prose' }) }

export default function Page() {
  return (
    <ProsePage
      contract={readContract('prose')}
      sources={{
        default: readExampleSource('prose/default.tsx'),
        article: readExampleSource('prose/article.tsx'),
        large: readExampleSource('prose/large.tsx'),
        'field-description': readExampleSource('prose/field-description.tsx'),
        'own-element': readExampleSource('prose/own-element.tsx'),
        'inset-text': readExampleSource('prose/inset-text.tsx'),
        steps: readExampleSource('prose/steps.tsx'),
        'images-and-media': readExampleSource('prose/images-and-media.tsx'),
      }}
    />
  )
}
