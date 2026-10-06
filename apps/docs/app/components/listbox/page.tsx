import type { Metadata } from 'next'
import { ListboxPage } from '../../../components/listbox-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Listbox' }) }

export default function Page() {
  return (
    <ListboxPage
      contract={readContract('listbox')}
      sources={{
        default: readExampleSource('listbox/default.tsx'),
        groups: readExampleSource('listbox/groups.tsx'),
        several: readExampleSource('listbox/several.tsx'),
        'disabled-option': readExampleSource('listbox/disabled-option.tsx'),
        'plain-form': readExampleSource('listbox/plain-form.tsx'),
        'native-select': readExampleSource('listbox/native-select.tsx'),
        'rich-options': readExampleSource('listbox/rich-options.tsx'),
        'language-switcher': readExampleSource('listbox/language-switcher.tsx'),
        'long-list': readExampleSource('listbox/long-list.tsx'),
      }}
    />
  )
}
