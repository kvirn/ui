import type { Metadata } from 'next'
import { NavigationPage } from '../../../components/navigation-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Navigation' }) }

export default function Page() {
  return (
    <NavigationPage
      contract={readContract('navigation')}
      sources={{
        default: readExampleSource('navigation/default.tsx'),
        'two-levels': readExampleSource('navigation/two-levels.tsx'),
        horizontal: readExampleSource('navigation/horizontal.tsx'),
        'page-not-listed': readExampleSource('navigation/page-not-listed.tsx'),
        'group-labels': readExampleSource('navigation/group-labels.tsx'),
        'collapsible-group': readExampleSource('navigation/collapsible-group.tsx'),
      }}
    />
  )
}
