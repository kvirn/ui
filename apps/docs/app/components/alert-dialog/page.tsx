import type { Metadata } from 'next'
import { AlertDialogPage } from '../../../components/alert-dialog-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'AlertDialog' }) }

export default function Page() {
  return (
    <AlertDialogPage
      contract={readContract('alert-dialog')}
      sources={{
        'confirm-delete': readExampleSource('alert-dialog/confirm-delete.tsx'),
        'timeout-warning': readExampleSource('alert-dialog/timeout-warning.tsx'),
      }}
    />
  )
}
