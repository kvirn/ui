'use client'
import { kvirnSpeechEngine } from '@kvirn-ui/core'
import { Heading } from '@kvirn-ui/react'
import { ReadAloud } from '@kvirn-ui/read-aloud'
import { useRef } from 'react'
import { voiceServiceUrl } from '../../lib/voice-service-url.ts'
import { useReadAloudTexts } from './texts.ts'

const voiceServiceName = 'Kvirn’s voice service'
const engine = kvirnSpeechEngine({ url: voiceServiceUrl, name: voiceServiceName })

export function IdlePanel() {
  const { texts } = useReadAloudTexts()
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root contentRef={articleRef} engine={engine} name={voiceServiceName}>
        <ReadAloud.Play />
        <ReadAloud.WhenStarted>
          <ReadAloud.Transport>
            <ReadAloud.Previous />
            <ReadAloud.Next />
          </ReadAloud.Transport>
          <ReadAloud.Stop />
          <ReadAloud.Settings />
          <ReadAloud.Status />
        </ReadAloud.WhenStarted>
        <ReadAloud.Note howItWorksHref="/privacy#voice" />
      </ReadAloud.Root>
      <article ref={articleRef}>
        <Heading as="h4">{texts.idlePanel.title}</Heading>
        <p>{texts.idlePanel.paragraph}</p>
      </article>
    </>
  )
}
