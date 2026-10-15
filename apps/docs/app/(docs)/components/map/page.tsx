import '@kvirn-ui/theme/map.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map-own.css'
import type { Metadata } from 'next'
import { MapPage } from '../../../../components/map-page.tsx'
import { readContract } from '../../../../lib/contract.ts'
import { readExampleSource } from '../../../../lib/example-source.ts'
import { messages } from '../../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Map' }) }

export default function Page() {
  return (
    <MapPage
      contract={readContract('map')}
      sources={{
        default: readExampleSource('map/default.tsx'),
        preschools: readExampleSource('map/preschools.tsx'),
        layers: readExampleSource('map/layers.tsx'),
        clusters: readExampleSource('map/clusters.tsx'),
        'own-list': readExampleSource('map/own-list.tsx'),
        'make-it-your-own': readExampleSource('map/make-it-your-own.tsx'),
      }}
    />
  )
}
