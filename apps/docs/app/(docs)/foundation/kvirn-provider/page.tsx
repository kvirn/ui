import type { Metadata } from 'next'
import { KvirnProviderPage } from '../../../../components/kvirn-provider-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'KvirnProvider' }) }

export default function Page() {
  return (
    <KvirnProviderPage
      contract={readContract('provider')}
      sources={{
        default: readExampleSource('kvirn-provider/default.tsx'),
        'another-language': readExampleSource('kvirn-provider/another-language.tsx'),
        'theme-switcher': readExampleSource('kvirn-provider/theme-switcher.tsx'),
      }}
    />
  )
}
