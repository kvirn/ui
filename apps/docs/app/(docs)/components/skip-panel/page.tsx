import type { Metadata } from 'next'
import { SkipPanelPage } from '../../../../components/skip-panel-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'SkipPanel' }) }

export default function Page() {
  return (
    <SkipPanelPage
      contract={readContract('skip-panel')}
      sources={{
        default: readExampleSource('skip-panel/default.tsx'),
        shortcuts: readExampleSource('skip-panel/shortcuts.tsx'),
        reopen: readExampleSource('skip-panel/reopen.tsx'),
        'turn-off': readExampleSource('skip-panel/turn-off.tsx'),
      }}
    />
  )
}
