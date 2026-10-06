import type { Metadata } from 'next'
import { ComboboxPage } from '../../../components/combobox-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Combobox' }) }

export default function Page() {
  return (
    <ComboboxPage
      contract={readContract('combobox')}
      sources={{
        default: readExampleSource('combobox/default.tsx'),
        several: readExampleSource('combobox/several.tsx'),
        'server-results': readExampleSource('combobox/server-results.tsx'),
        'own-filter': readExampleSource('combobox/own-filter.tsx'),
        'not-in-list': readExampleSource('combobox/not-in-list.tsx'),
        'rich-options': readExampleSource('combobox/rich-options.tsx'),
        'plain-form': readExampleSource('combobox/plain-form.tsx'),
        'long-list': readExampleSource('combobox/long-list.tsx'),
      }}
    />
  )
}
