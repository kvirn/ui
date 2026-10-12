'use client'
import { Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultLink() {
  const { texts, isFallback } = useLinkTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        {texts.sentenceBefore}
        <Link.Root href="#apply">{texts.sentenceLink}</Link.Root>
        {texts.sentenceAfter}
      </p>
    </InEnglishWhenFallback>
  )
}
