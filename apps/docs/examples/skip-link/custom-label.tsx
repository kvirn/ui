'use client'
import { SkipLink } from '@kvirn-ui/react'
import { useSkipLinkTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function CustomLabel() {
  const { texts, isFallback } = useSkipLinkTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
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
    </InEnglishWhenFallback>
  )
}
