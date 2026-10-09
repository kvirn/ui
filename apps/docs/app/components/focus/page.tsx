import type { Metadata } from 'next'
import { FocusPage } from '../../../components/focus-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Focus' }) }

export default function Page() {
  return (
    <FocusPage
      contract={readContract('focus')}
      sources={{
        'restore-drawer': readExampleSource('focus/restore-drawer.tsx'),
        'loop-drawer': readExampleSource('focus/loop-drawer.tsx'),
        'wizard-step': readExampleSource('focus/wizard-step.tsx'),
      }}
    />
  )
}
