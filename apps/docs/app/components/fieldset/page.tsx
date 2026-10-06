import type { Metadata } from 'next'
import { FieldsetPage } from '../../../components/fieldset-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Fieldset' }) }

export default function Page() {
  return (
    <FieldsetPage
      contract={readContract('fieldset')}
      sources={{
        default: readExampleSource('fieldset/default.tsx'),
        group: readExampleSource('fieldset/group.tsx'),
        'error-on-submit': readExampleSource('fieldset/error-on-submit.tsx'),
        disabled: readExampleSource('fieldset/disabled.tsx'),
        'use-fieldset': readExampleSource('fieldset/use-fieldset.tsx'),
      }}
    />
  )
}
