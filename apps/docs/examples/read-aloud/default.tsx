'use client'
import { Heading, ReadAloud } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useReadAloudTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Player() {
  const { texts, isFallback } = useReadAloudTexts()
  const articleRef = useRef<HTMLElement>(null)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <ReadAloud.Root contentRef={articleRef}>
          <ReadAloud.Play />
          <ReadAloud.Previous />
          <ReadAloud.Next />
          <ReadAloud.Stop />
          <ReadAloud.Rate />
          <ReadAloud.Voice />
          <ReadAloud.Status />
          <ReadAloud.SelectionTrigger />
        </ReadAloud.Root>
        <article ref={articleRef}>
          <Heading as="h4">{texts.title}</Heading>
          <p>{texts.firstParagraph}</p>
          <p>{texts.secondParagraph}</p>
        </article>
      </>
    </InEnglishWhenFallback>
  )
}
