import type { Metadata } from 'next'
import { DisplaySettingsPage } from '../../../../components/display-settings-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'DisplaySettings' }) }

export default function Page() {
  return (
    <DisplaySettingsPage
      contract={readContract('display-settings')}
      sources={{
        default: readExampleSource('display-settings/default.tsx'),
        'in-the-header': readExampleSource('display-settings/in-the-header.tsx'),
        'small-space': readExampleSource('display-settings/small-space.tsx'),
        'settings-page': readExampleSource('display-settings/settings-page.tsx'),
        'own-markup': readExampleSource('display-settings/own-markup.tsx'),
      }}
    />
  )
}
