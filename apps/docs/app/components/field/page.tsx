import type { Metadata } from 'next'
import { FieldPage } from '../../../components/field-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Field' }) }

export default function Page() {
  return (
    <FieldPage
      contract={readContract('field')}
      sources={{
        default: readExampleSource('field/default.tsx'),
        'required-and-optional': readExampleSource('field/required-and-optional.tsx'),
        'description-and-help-text': readExampleSource('field/description-and-help-text.tsx'),
        'error-on-submit': readExampleSource('field/error-on-submit.tsx'),
        disabled: readExampleSource('field/disabled.tsx'),
        'use-field': readExampleSource('field/use-field.tsx'),
      }}
    />
  )
}
