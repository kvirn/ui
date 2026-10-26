import '@kvirn-ui/theme/read-aloud.css'
import type { Metadata } from 'next'
import { ReadAloudPage } from '../../../../components/read-aloud-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'ReadAloud' }) }

export default function Page() {
  return (
    <ReadAloudPage
      contract={readContract('read-aloud')}
      sources={{
        default: readExampleSource('read-aloud/default.tsx'),
        bar: readExampleSource('read-aloud/bar.tsx'),
        'cms-markers': readExampleSource('read-aloud/cms-markers.tsx'),
        language: readExampleSource('read-aloud/language.tsx'),
        'idle-panel': readExampleSource('read-aloud/idle-panel.tsx'),
      }}
    />
  )
}
