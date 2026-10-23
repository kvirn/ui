import '@kvirn-ui/theme/map.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Metadata } from 'next'
import { AddressSearchPage } from '../../../../components/address-search-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'AddressSearch' }) }

export default function Page() {
  return (
    <AddressSearchPage
      contract={readContract('address-search')}
      sources={{
        default: readExampleSource('address-search/default.tsx'),
        'recycling-station': readExampleSource('address-search/recycling-station.tsx'),
        'report-a-fault': readExampleSource('address-search/report-a-fault.tsx'),
        'change-of-address': readExampleSource('address-search/change-of-address.tsx'),
      }}
    />
  )
}
