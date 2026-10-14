'use client'
import { Link, TopBar } from '@kvirn-ui/react'
import { useTopBarTexts } from './texts.ts'

export function PhoneLink() {
  const { texts } = useTopBarTexts()
  return (
    <TopBar>
      <p>{texts.hours}</p>
      <Link.Root href="tel:012345678">{texts.call}</Link.Root>
    </TopBar>
  )
}
