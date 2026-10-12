'use client'
import { SkipLink } from '@kvirn-ui/react'
import { useSkipLinkTexts } from './texts.ts'

export function CustomLabel() {
  const { texts } = useSkipLinkTexts()
  return (
    <div>
      <p>
        <small>{texts.hint}</small>
      </p>
      <SkipLink href="#skip-link-form">{texts.customLabel}</SkipLink>
      <p>{texts.header}</p>
      <div id="skip-link-form">
        <p>{texts.form}</p>
      </div>
    </div>
  )
}
