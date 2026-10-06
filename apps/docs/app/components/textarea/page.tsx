import type { Metadata } from 'next'
import { TextareaPage } from '../../../components/textarea-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Textarea' }) }

export default function Page() {
  return (
    <TextareaPage
      contract={readContract('textarea')}
      sources={{
        default: readExampleSource('textarea/default.tsx'),
        'character-limit': readExampleSource('textarea/character-limit.tsx'),
        'count-your-way': readExampleSource('textarea/count-your-way.tsx'),
        'error-on-submit': readExampleSource('textarea/error-on-submit.tsx'),
        'restored-draft': readExampleSource('textarea/restored-draft.tsx'),
        'count-under-text-input': readExampleSource('textarea/count-under-text-input.tsx'),
      }}
    />
  )
}
