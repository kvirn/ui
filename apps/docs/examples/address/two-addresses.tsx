'use client'
import { Address, Stack } from '@kvirn-ui/react'
import { useAddressTexts } from './texts.ts'

export function TwoAddresses() {
  const { texts } = useAddressTexts()
  return (
    <Stack>
      <Address>
        <strong>{texts.visitingLabel}</strong>
        <br />
        {texts.organisation}
        <br />
        {texts.street}
        <br />
        {texts.postalCity}
      </Address>
      <Address>
        <strong>{texts.postalLabel}</strong>
        <br />
        {texts.organisation}
        <br />
        {texts.registry}
        <br />
        {texts.box}
        <br />
        {texts.postalCity}
      </Address>
    </Stack>
  )
}
