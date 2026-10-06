import type { Metadata } from 'next'
import { ButtonGroupPage } from '../../../components/button-group-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'ButtonGroup' }) }

export default function Page() {
  return (
    <ButtonGroupPage
      contract={readContract('button-group')}
      sources={{
        default: readExampleSource('button-group/default.tsx'),
        'card-footer': readExampleSource('button-group/card-footer.tsx'),
        'named-by-heading': readExampleSource('button-group/named-by-heading.tsx'),
      }}
    />
  )
}
