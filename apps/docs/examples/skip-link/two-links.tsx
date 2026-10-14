'use client'
import { SkipLink } from '@kvirn-ui/react'
import { useSkipLinkTexts } from './texts.ts'

export function TwoLinks() {
  const { texts } = useSkipLinkTexts()
  return (
    <div>
      <p>
        <small>{texts.hintTwo}</small>
      </p>
      <SkipLink href="#skip-link-two-main" />
      <SkipLink href="#skip-link-two-search">{texts.searchLabel}</SkipLink>
      <p>{texts.header}</p>
      <div id="skip-link-two-search">
        <p>{texts.search}</p>
      </div>
      <div id="skip-link-two-main">
        <p>{texts.main}</p>
      </div>
    </div>
  )
}
