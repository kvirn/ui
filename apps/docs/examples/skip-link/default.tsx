'use client'
import { SkipLink } from '@kvirn-ui/react'
import { useSkipLinkTexts } from './texts.ts'

export function DefaultSkipLink() {
  const { texts, textLang } = useSkipLinkTexts()
  return (
    <div lang={textLang}>
      <p>
        <small>{texts.hint}</small>
      </p>
      <SkipLink href="#skip-link-main" />
      <p>{texts.header}</p>
      <div id="skip-link-main">
        <p>{texts.main}</p>
      </div>
    </div>
  )
}
