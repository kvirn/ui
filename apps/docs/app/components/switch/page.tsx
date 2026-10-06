import type { Metadata } from 'next'
import { SwitchPage } from '../../../components/switch-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Switch' }) }

export default function Page() {
  return (
    <SwitchPage
      contract={readContract('switch')}
      sources={{
        default: readExampleSource('switch/default.tsx'),
        'controlled-setting': readExampleSource('switch/controlled-setting.tsx'),
        'plain-form': readExampleSource('switch/plain-form.tsx'),
        'help-text': readExampleSource('switch/help-text.tsx'),
      }}
    />
  )
}
