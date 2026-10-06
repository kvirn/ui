import type { Metadata } from 'next'
import { BreadcrumbPage } from '../../../components/breadcrumb-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Breadcrumb' }) }

export default function Page() {
  return (
    <BreadcrumbPage
      contract={readContract('breadcrumb')}
      sources={{
        default: readExampleSource('breadcrumb/default.tsx'),
        'long-trail': readExampleSource('breadcrumb/long-trail.tsx'),
        'own-label': readExampleSource('breadcrumb/own-label.tsx'),
      }}
    />
  )
}
