import type { Metadata } from 'next'
import { QuickExitPage } from '../../../../components/quick-exit-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'QuickExit' }) }

export default function Page() {
  return (
    <QuickExitPage
      contract={readContract('quick-exit')}
      sources={{
        default: readExampleSource('quick-exit/default.tsx'),
        'support-page': readExampleSource('quick-exit/support-page.tsx'),
        'end-session': readExampleSource('quick-exit/end-session.tsx'),
        'no-shortcut': readExampleSource('quick-exit/no-shortcut.tsx'),
        'own-markup': readExampleSource('quick-exit/own-markup.tsx'),
      }}
    />
  )
}
