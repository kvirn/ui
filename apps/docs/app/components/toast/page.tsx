import type { Metadata } from 'next'
import { ToastPage } from '../../../components/toast-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Toast' }) }

export default function Page() {
  return (
    <ToastPage
      contract={readContract('toast')}
      sources={{
        default: readExampleSource('toast/default.tsx'),
        'with-an-undo': readExampleSource('toast/with-an-undo.tsx'),
        'update-in-place': readExampleSource('toast/update-in-place.tsx'),
      }}
    />
  )
}
