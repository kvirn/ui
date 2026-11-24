'use client'
import { Link } from '@kvirn/ui'
import { useLinkTexts } from './texts.ts'

export function DefaultLink() {
  const { texts } = useLinkTexts()
  return (
    <p>
      {texts.sentenceBefore}
      <Link.Root href="#apply">{texts.sentenceLink}</Link.Root>
      {texts.sentenceAfter}
    </p>
  )
}
