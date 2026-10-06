import type { Metadata } from 'next'
import { VisuallyHiddenPage } from '../../../components/visually-hidden-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: 'VisuallyHidden' }),
}

export default function Page() {
  return (
    <VisuallyHiddenPage
      contract={readContract('visually-hidden')}
      sources={{
        default: readExampleSource('visually-hidden/default.tsx'),
        'button-context': readExampleSource('visually-hidden/button-context.tsx'),
        'hidden-heading': readExampleSource('visually-hidden/hidden-heading.tsx'),
        'icon-status': readExampleSource('visually-hidden/icon-status.tsx'),
      }}
    />
  )
}
