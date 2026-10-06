'use client'
import { Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'

export function OtherLanguage() {
  const { texts, textLang } = useLinkTexts()
  return (
    <p lang={textLang}>
      {texts.otherLanguageIntro}
      <Link.Root href="#fi" hrefLang="fi" lang="fi">
        {texts.otherLanguageLink}
      </Link.Root>
    </p>
  )
}
