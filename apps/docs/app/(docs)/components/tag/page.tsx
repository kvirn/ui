import type { Metadata } from 'next'
import { TagPage } from '../../../../components/tag-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Tag' }) }

export default function Page() {
  return (
    <TagPage
      contract={readContract('tag')}
      sources={{
        default: readExampleSource('tag/default.tsx'),
        'filter-a-list': readExampleSource('tag/filter-a-list.tsx'),
        'locked-value': readExampleSource('tag/locked-value.tsx'),
        'focus-fallback': readExampleSource('tag/focus-fallback.tsx'),
        'own-markup': readExampleSource('tag/own-markup.tsx'),
      }}
    />
  )
}
