'use client'
import { ReadAloud } from '@kvirn-ui/react'
import { useRef } from 'react'
import { swedishArticle } from './texts.ts'

export function SwedishContent() {
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root contentRef={articleRef} lang="sv">
        <ReadAloud.Play />
        <ReadAloud.Stop />
        <ReadAloud.Status />
      </ReadAloud.Root>
      <article ref={articleRef} lang="sv">
        <p>{swedishArticle.firstParagraph}</p>
      </article>
    </>
  )
}
