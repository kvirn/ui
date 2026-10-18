import type { Metadata } from 'next'
import { DividerPage } from '../../../../components/divider-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Divider' }) }

export default function Page() {
  return (
    <DividerPage
      contract={readContract('divider')}
      sources={{
        default: readExampleSource('divider/default.tsx'),
        'decorative-line': readExampleSource('divider/decorative-line.tsx'),
        'stronger-line': readExampleSource('divider/stronger-line.tsx'),
      }}
    />
  )
}
