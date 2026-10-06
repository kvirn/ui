import type { Metadata } from 'next'
import { KbdPage } from '../../../components/kbd-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Kbd' }) }

export default function Page() {
  return (
    <KbdPage
      contract={readContract('kbd')}
      sources={{
        default: readExampleSource('kbd/default.tsx'),
        combination: readExampleSource('kbd/combination.tsx'),
        'shortcut-list': readExampleSource('kbd/shortcut-list.tsx'),
      }}
    />
  )
}
