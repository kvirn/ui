'use client'
import { SkipLink } from '@kvirn-ui/react'
import { useSkipLinkTexts } from './texts.ts'

export function CustomLabel() {
  const { texts, textLang } = useSkipLinkTexts()
  return (
    <div>
      <p lang={textLang}>
        <small>{texts.hint}</small>
      </p>
      <SkipLink href="#skip-link-form" lang={textLang}>
        {texts.customLabel}
      </SkipLink>
      <p lang={textLang}>{texts.header}</p>
      <div id="skip-link-form" lang={textLang}>
        <p>{texts.form}</p>
      </div>
    </div>
  )
}
