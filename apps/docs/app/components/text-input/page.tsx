import type { Metadata } from 'next'
import { TextInputPage } from '../../../components/text-input-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'TextInput' }) }

export default function Page() {
  return (
    <TextInputPage
      contract={readContract('text-input')}
      sources={{
        default: readExampleSource('text-input/default.tsx'),
        'input-types': readExampleSource('text-input/input-types.tsx'),
        width: readExampleSource('text-input/width.tsx'),
        controlled: readExampleSource('text-input/controlled.tsx'),
        'plain-form': readExampleSource('text-input/plain-form.tsx'),
        'masked-code': readExampleSource('text-input/masked-code.tsx'),
        'own-input': readExampleSource('text-input/own-input.tsx'),
      }}
    />
  )
}
