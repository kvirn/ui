'use client'
import { SkipLink } from '@kvirn-ui/react'
import { useSkipLinkTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultSkipLink() {
  const { texts, isFallback } = useSkipLinkTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <p>
          <small>{texts.hint}</small>
        </p>
        <SkipLink href="#skip-link-main" />
        <p>{texts.header}</p>
        <div id="skip-link-main">
          <p>{texts.main}</p>
        </div>
      </div>
    </InEnglishWhenFallback>
  )
}
