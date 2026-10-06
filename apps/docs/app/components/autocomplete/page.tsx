import type { Metadata } from 'next'
import { AutocompletePage } from '../../../components/autocomplete-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Autocomplete' }) }

export default function Page() {
  return (
    <AutocompletePage
      contract={readContract('autocomplete')}
      sources={{
        default: readExampleSource('autocomplete/default.tsx'),
        controlled: readExampleSource('autocomplete/controlled.tsx'),
        'server-suggestions': readExampleSource('autocomplete/server-suggestions.tsx'),
        'own-filter': readExampleSource('autocomplete/own-filter.tsx'),
        'rich-suggestions': readExampleSource('autocomplete/rich-suggestions.tsx'),
        'plain-form': readExampleSource('autocomplete/plain-form.tsx'),
        'long-list': readExampleSource('autocomplete/long-list.tsx'),
      }}
    />
  )
}
