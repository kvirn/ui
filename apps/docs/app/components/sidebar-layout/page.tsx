import type { Metadata } from 'next'
import { SidebarLayoutPage } from '../../../components/sidebar-layout-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'SidebarLayout' }) }

export default function Page() {
  return (
    <SidebarLayoutPage
      contract={readContract('sidebar-layout')}
      sources={{
        default: readExampleSource('sidebar-layout/default.tsx'),
        'service-page': readExampleSource('sidebar-layout/service-page.tsx'),
        'side-information': readExampleSource('sidebar-layout/side-information.tsx'),
      }}
    />
  )
}
