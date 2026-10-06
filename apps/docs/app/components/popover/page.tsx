import type { Metadata } from 'next'
import { PopoverPage } from '../../../components/popover-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Popover' }) }

export default function Page() {
  return (
    <PopoverPage
      contract={readContract('popover')}
      sources={{
        default: readExampleSource('popover/default.tsx'),
        'with-a-form': readExampleSource('popover/with-a-form.tsx'),
        controlled: readExampleSource('popover/controlled.tsx'),
        placement: readExampleSource('popover/placement.tsx'),
      }}
    />
  )
}
