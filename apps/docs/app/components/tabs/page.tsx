import type { Metadata } from 'next'
import { TabsPage } from '../../../components/tabs-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Tabs' }) }

export default function Page() {
  return (
    <TabsPage
      contract={readContract('tabs')}
      sources={{
        default: readExampleSource('tabs/default.tsx'),
        'manual-activation': readExampleSource('tabs/manual-activation.tsx'),
        vertical: readExampleSource('tabs/vertical.tsx'),
        'disabled-tab': readExampleSource('tabs/disabled-tab.tsx'),
        controlled: readExampleSource('tabs/controlled.tsx'),
        'focusable-panel': readExampleSource('tabs/focusable-panel.tsx'),
      }}
    />
  )
}
