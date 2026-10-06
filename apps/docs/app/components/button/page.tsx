import type { Metadata } from 'next'
import { ButtonPage } from '../../../components/button-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Button' }) }

export default function Page() {
  return (
    <ButtonPage
      contract={readContract('button')}
      sources={{
        default: readExampleSource('button/default.tsx'),
        variants: readExampleSource('button/variants.tsx'),
        'disabled-with-reason': readExampleSource('button/disabled-with-reason.tsx'),
        'submit-form': readExampleSource('button/submit-form.tsx'),
        saving: readExampleSource('button/saving.tsx'),
        'icon-only': readExampleSource('button/icon-only.tsx'),
      }}
    />
  )
}
