import type { Metadata } from 'next'
import { CheckboxGroupPage } from '../../../components/checkbox-group-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: 'CheckboxGroup' }),
}

export default function Page() {
  return (
    <CheckboxGroupPage
      contract={readContract('checkbox-group')}
      sources={{
        default: readExampleSource('checkbox-group/default.tsx'),
        controlled: readExampleSource('checkbox-group/controlled.tsx'),
        'plain-form': readExampleSource('checkbox-group/plain-form.tsx'),
        'option-help-text': readExampleSource('checkbox-group/option-help-text.tsx'),
        'error-on-submit': readExampleSource('checkbox-group/error-on-submit.tsx'),
        disabled: readExampleSource('checkbox-group/disabled.tsx'),
      }}
    />
  )
}
