'use client'
import { kvirnSpeechEngine } from '@kvirn-ui/core'
import { Heading } from '@kvirn-ui/react'
import { ReadAloud } from '@kvirn-ui/read-aloud'
import { useRef } from 'react'
import { voiceServiceUrl } from '../../lib/voice-service-url.ts'
import { swedishDecisionText, useReadAloudTexts } from './texts.ts'

const voiceServiceName = 'Kvirn’s voice service'
const engine = kvirnSpeechEngine({ url: voiceServiceUrl, name: voiceServiceName })

export function LanguageOfParts() {
  const { texts } = useReadAloudTexts()
  const articleRef = useRef<HTMLElement>(null)
  return (
    <>
      <ReadAloud.Root contentRef={articleRef} engine={engine} name={voiceServiceName}>
        <ReadAloud.Play />
        <ReadAloud.Status />
      </ReadAloud.Root>
      <article ref={articleRef}>
        <Heading as="h4">{texts.language.title}</Heading>
        <p>{texts.language.intro}</p>
        {/* lang="sv" on just this part (3.1.2 Language of Parts): Listen reads it in Swedish, even
         * though the interface around it, and the rest of this article, are in English. */}
        <blockquote lang="sv">
          <p>{swedishDecisionText}</p>
        </blockquote>
      </article>
    </>
  )
}
