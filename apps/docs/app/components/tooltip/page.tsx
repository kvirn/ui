import type { Metadata } from 'next'
import { TooltipPage } from '../../../components/tooltip-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Tooltip' }) }

export default function Page() {
  return (
    <TooltipPage
      contract={readContract('tooltip')}
      sources={{
        default: readExampleSource('tooltip/default.tsx'),
        'with-a-shortcut': readExampleSource('tooltip/with-a-shortcut.tsx'),
        'extra-information': readExampleSource('tooltip/extra-information.tsx'),
        'button-row': readExampleSource('tooltip/button-row.tsx'),
        timing: readExampleSource('tooltip/timing.tsx'),
      }}
    />
  )
}
