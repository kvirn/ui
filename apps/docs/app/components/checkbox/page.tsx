import type { Metadata } from 'next'
import { CheckboxPage } from '../../../components/checkbox-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Checkbox' }) }

export default function Page() {
  return (
    <CheckboxPage
      contract={readContract('checkbox')}
      sources={{
        default: readExampleSource('checkbox/default.tsx'),
        declaration: readExampleSource('checkbox/declaration.tsx'),
        'plain-form': readExampleSource('checkbox/plain-form.tsx'),
        'help-text': readExampleSource('checkbox/help-text.tsx'),
        'select-all': readExampleSource('checkbox/select-all.tsx'),
      }}
    />
  )
}
