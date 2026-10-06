'use client'
import { Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'

export function DefaultLink() {
  const { texts, textLang } = useLinkTexts()
  return (
    <p lang={textLang}>
      {texts.sentenceBefore}
      <Link.Root href="#apply">{texts.sentenceLink}</Link.Root>
      {texts.sentenceAfter}
    </p>
  )
}
