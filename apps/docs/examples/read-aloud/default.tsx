'use client'
import { kvirnSpeechEngine } from '@kvirn-ui/core'
import { Heading } from '@kvirn-ui/react'
import { ReadAloud } from '@kvirn-ui/read-aloud'
import { useRef } from 'react'
import { voiceServiceUrl } from '../../lib/voice-service-url.ts'
import { useReadAloudTexts } from './texts.ts'

// Made once, outside the component, so the player gets the same engine on every render. `name` is
// the recipient the Note part tells the reader about, so it is passed explicitly rather than left
// to default to the URL's host.
const voiceServiceName = 'Kvirn’s voice service'
const engine = kvirnSpeechEngine({ url: voiceServiceUrl, name: voiceServiceName })

export function Player() {
  const { texts } = useReadAloudTexts()
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root contentRef={articleRef} engine={engine} name={voiceServiceName}>
        <ReadAloud.Play />
        <ReadAloud.Previous />
        <ReadAloud.Next />
        <ReadAloud.Stop />
        <ReadAloud.Rate />
        <ReadAloud.Status />
        <ReadAloud.Note howItWorksHref="/privacy#voice" />
      </ReadAloud.Root>
      <article ref={articleRef}>
        <Heading as="h4">{texts.title}</Heading>
        <p>{texts.firstParagraph}</p>
        <p>{texts.secondParagraph}</p>
      </article>
    </>
  )
}
