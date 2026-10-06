import type { Metadata } from 'next'
import { IconPage } from '../../../components/icon-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Icon' }) }

export default function Page() {
  return (
    <IconPage
      contract={readContract('icon')}
      sources={{
        default: readExampleSource('icon/default.tsx'),
        'with-label': readExampleSource('icon/with-label.tsx'),
        sizes: readExampleSource('icon/sizes.tsx'),
        'own-component': readExampleSource('icon/own-component.tsx'),
        'one-off-drawing': readExampleSource('icon/one-off-drawing.tsx'),
        'mirror-in-rtl': readExampleSource('icon/mirror-in-rtl.tsx'),
      }}
    />
  )
}
