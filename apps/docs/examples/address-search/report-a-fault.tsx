'use client'
import { AddressSearch } from '@kvirn-ui/map'
import type { AddressResult } from '@kvirn-ui/map'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import { Stack } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAddressSearchTexts } from './texts.ts'

const geocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['se'],
})

export function FaultAddressSearch() {
  const { texts } = useAddressSearchTexts()
  const [place, setPlace] = useState<AddressResult | null>(null)

  return (
    <Stack className="kv-stack--gap-8">
      <search>
        {/* This geocoder allows search as you type. debounce={false} searches on request instead:
            nothing is sent until the visitor presses Enter or Search. */}
        <AddressSearch
          geocoder={geocoder}
          debounce={false}
          label={texts.faultLabel}
          messages={{ helpRequest: texts.faultHelp }}
          onResult={setPlace}
        />
      </search>
      <p>{place === null ? texts.noPlace : texts.faultAt(place.label)}</p>
    </Stack>
  )
}
