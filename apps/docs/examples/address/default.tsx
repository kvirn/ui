'use client'
import { Address, Link } from '@kvirn-ui/react'
import { useAddressTexts } from './texts.ts'

export function DefaultAddress() {
  const { texts } = useAddressTexts()
  return (
    <Address>
      {texts.organisation}
      <br />
      {texts.street}
      <br />
      {texts.postalCity}
      <br />
      <Link href={texts.phoneHref}>{texts.phone}</Link>
      <br />
      <Link href={texts.emailHref}>{texts.email}</Link>
    </Address>
  )
}
