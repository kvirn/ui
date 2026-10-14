'use client'
import { Heading, ReadAloud } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useReadAloudTexts } from './texts.ts'

export function PlayerInsideContent() {
  const { texts } = useReadAloudTexts()
  const noticeRef = useRef<HTMLElement>(null)
  // The player sits inside the element it reads, so one ref covers the whole notice. The Root
  // marks its own words as not to be read, so the button names and the status text are left
  // out without you marking anything.
  return (
    <article ref={noticeRef}>
      <ReadAloud.Root contentRef={noticeRef}>
        <ReadAloud.Play />
        <ReadAloud.Stop />
        <ReadAloud.Status />
      </ReadAloud.Root>
      <Heading as="h4">{texts.roadWorksTitle}</Heading>
      <p>{texts.roadWorksText}</p>
    </article>
  )
}
