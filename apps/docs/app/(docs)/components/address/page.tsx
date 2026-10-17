import type { Metadata } from 'next'
import { AddressPage } from '../../../../components/address-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Address' }) }

export default function Page() {
  return (
    <AddressPage
      contract={readContract('address')}
      sources={{
        default: readExampleSource('address/default.tsx'),
        'two-addresses': readExampleSource('address/two-addresses.tsx'),
        'article-contact': readExampleSource('address/article-contact.tsx'),
      }}
    />
  )
}
