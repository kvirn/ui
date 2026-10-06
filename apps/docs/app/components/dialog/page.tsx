import type { Metadata } from 'next'
import { DialogPage } from '../../../components/dialog-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Dialog' }) }

export default function Page() {
  return (
    <DialogPage
      contract={readContract('dialog')}
      sources={{
        default: readExampleSource('dialog/default.tsx'),
        'with-a-form': readExampleSource('dialog/with-a-form.tsx'),
        controlled: readExampleSource('dialog/controlled.tsx'),
      }}
    />
  )
}
