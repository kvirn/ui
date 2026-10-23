'use client'
import { AddressSearch } from '@kvirn-ui/map'
import type { AddressResult } from '@kvirn-ui/map'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import { Stack } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAddressSearchTexts } from './texts.ts'

// Made once, outside the component, so the field gets the same geocoder on every render.
// This example searches Sweden only.
const geocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['se'],
})

export function DefaultAddressSearch() {
  const { texts } = useAddressSearchTexts()
  const [chosen, setChosen] = useState<AddressResult | null>(null)

  return (
    <Stack className="kv-stack--gap-8">
      <search>
        <AddressSearch geocoder={geocoder} onResult={setChosen} />
      </search>
      <p>
        {chosen === null
          ? texts.nothingChosen
          : texts.chosen(chosen.label, chosen.position.latitude, chosen.position.longitude)}
      </p>
    </Stack>
  )
}
