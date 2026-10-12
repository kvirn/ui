'use client'
import { Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OtherLanguage() {
  const { texts, isFallback } = useLinkTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        {texts.otherLanguageIntro}
        <span lang="fi">
          <Link.Root href="#fi" hrefLang="fi">
            {texts.otherLanguageLink}
          </Link.Root>
        </span>
      </p>
    </InEnglishWhenFallback>
  )
}
