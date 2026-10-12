'use client'
import { useSkipLink } from '@kvirn-ui/react'
import { useSkipLinkTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnElement() {
  const { texts, isFallback } = useSkipLinkTexts()
  const { skipLinkProps, label } = useSkipLink({ href: '#skip-link-own' })
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <p>
          <small>{texts.hint}</small>
        </p>
        <a {...skipLinkProps}>{label}</a>
        <p>{texts.header}</p>
        <div id="skip-link-own">
          <p>{texts.ownElement}</p>
        </div>
      </div>
    </InEnglishWhenFallback>
  )
}
