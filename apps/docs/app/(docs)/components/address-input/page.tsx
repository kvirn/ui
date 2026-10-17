import type { Metadata } from 'next'
import { AddressInputPage } from '../../../../components/address-input-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'AddressInput' }) }

export default function Page() {
  return (
    <AddressInputPage
      contract={readContract('address-input')}
      sources={{
        default: readExampleSource('address-input/default.tsx'),
        'errors-per-box': readExampleSource('address-input/errors-per-box.tsx'),
        'address-not-found': readExampleSource('address-input/address-not-found.tsx'),
        'address-abroad': readExampleSource('address-input/address-abroad.tsx'),
        'known-address': readExampleSource('address-input/known-address.tsx'),
      }}
    />
  )
}
