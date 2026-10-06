import type { Metadata } from 'next'
import { ToolbarPage } from '../../../components/toolbar-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Toolbar' }) }

export default function Page() {
  return (
    <ToolbarPage
      contract={readContract('toolbar')}
      sources={{
        default: readExampleSource('toolbar/default.tsx'),
        toggles: readExampleSource('toolbar/toggles.tsx'),
        unavailable: readExampleSource('toolbar/unavailable.tsx'),
        'other-controls': readExampleSource('toolbar/other-controls.tsx'),
        vertical: readExampleSource('toolbar/vertical.tsx'),
        'no-loop': readExampleSource('toolbar/no-loop.tsx'),
      }}
    />
  )
}
