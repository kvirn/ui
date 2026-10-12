'use client'
import { ReadAloud } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useReadAloudTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function MinimalPlayer() {
  const { texts, isFallback } = useReadAloudTexts()
  const articleRef = useRef<HTMLElement>(null)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <ReadAloud.Root contentRef={articleRef}>
          <ReadAloud.Play />
          <ReadAloud.Stop />
          <ReadAloud.Status />
        </ReadAloud.Root>
        <article ref={articleRef}>
          <p>{texts.firstParagraph}</p>
          <p data-kv-read-aloud-skip="">{texts.skipped}</p>
        </article>
      </>
    </InEnglishWhenFallback>
  )
}
