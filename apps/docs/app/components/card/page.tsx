import type { Metadata } from 'next'
import { CardPage } from '../../../components/card-page.tsx'
import { readContract } from '../../../lib/contract.ts'
import { readExampleSource } from '../../../lib/example-source.ts'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Card' }) }

export default function Page() {
  return (
    <CardPage
      contract={readContract('card')}
      sources={{
        default: readExampleSource('card/default.tsx'),
        actions: readExampleSource('card/actions.tsx'),
        list: readExampleSource('card/list.tsx'),
        article: readExampleSource('card/article.tsx'),
        dividers: readExampleSource('card/dividers.tsx'),
      }}
    />
  )
}
