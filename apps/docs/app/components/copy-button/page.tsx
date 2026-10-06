import type { Metadata } from 'next'
import { CopyButtonPage } from '../../../components/copy-button-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'CopyButton' }) }

export default function Page() {
  return (
    <CopyButtonPage
      contract={readContract('copy-button')}
      sources={{
        default: readExampleSource('copy-button/default.tsx'),
        'reference-number': readExampleSource('copy-button/reference-number.tsx'),
        'own-cue': readExampleSource('copy-button/own-cue.tsx'),
      }}
    />
  )
}
