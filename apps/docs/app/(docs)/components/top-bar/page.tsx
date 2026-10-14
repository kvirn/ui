import type { Metadata } from 'next'
import { TopBarPage } from '../../../../components/top-bar-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'TopBar' }) }

export default function Page() {
  return (
    <TopBarPage
      contract={readContract('top-bar')}
      sources={{
        default: readExampleSource('top-bar/default.tsx'),
        'button-tool': readExampleSource('top-bar/button-tool.tsx'),
        'phone-link': readExampleSource('top-bar/phone-link.tsx'),
        filled: readExampleSource('top-bar/filled.tsx'),
        'own-element': readExampleSource('top-bar/own-element.tsx'),
      }}
    />
  )
}
