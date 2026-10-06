import type { Metadata } from 'next'
import { RadioGroupPage } from '../../../components/radio-group-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'RadioGroup' }) }

export default function Page() {
  return (
    <RadioGroupPage
      contract={readContract('radio-group')}
      sources={{
        default: readExampleSource('radio-group/default.tsx'),
        controlled: readExampleSource('radio-group/controlled.tsx'),
        'plain-form': readExampleSource('radio-group/plain-form.tsx'),
        'option-help-text': readExampleSource('radio-group/option-help-text.tsx'),
        'error-on-submit': readExampleSource('radio-group/error-on-submit.tsx'),
        'disabled-option': readExampleSource('radio-group/disabled-option.tsx'),
      }}
    />
  )
}
