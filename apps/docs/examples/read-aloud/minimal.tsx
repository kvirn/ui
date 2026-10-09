'use client'
import { ReadAloud } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useReadAloudTexts } from './texts.ts'

export function MinimalPlayer() {
  const { texts, textLang } = useReadAloudTexts()
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root contentRef={articleRef}>
        <ReadAloud.Play />
        <ReadAloud.Stop />
        <ReadAloud.Status />
      </ReadAloud.Root>
      <article ref={articleRef} lang={textLang}>
        <p>{texts.firstParagraph}</p>
        <p data-kv-read-aloud-skip="">{texts.skipped}</p>
      </article>
    </>
  )
}
