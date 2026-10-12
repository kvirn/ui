'use client'
import { Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'

export function OtherLanguage() {
  const { texts } = useLinkTexts()
  return (
    <p>
      {texts.otherLanguageIntro}
      <span lang="fi">
        <Link.Root href="#fi" hrefLang="fi">
          {texts.otherLanguageLink}
        </Link.Root>
      </span>
    </p>
  )
}
