'use client'
import { useSkipLink } from '@kvirn-ui/react'
import { useSkipLinkTexts } from './texts.ts'

export function OwnElement() {
  const { texts, textLang } = useSkipLinkTexts()
  const { skipLinkProps, label } = useSkipLink({ href: '#skip-link-own' })
  return (
    <div>
      <p lang={textLang}>
        <small>{texts.hint}</small>
      </p>
      <a {...skipLinkProps}>{label}</a>
      <p lang={textLang}>{texts.header}</p>
      <div id="skip-link-own" lang={textLang}>
        <p>{texts.ownElement}</p>
      </div>
    </div>
  )
}
