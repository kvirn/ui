'use client'
import { kvirnSpeechEngine } from '@kvirn-ui/core'
import { ReadAloud } from '@kvirn-ui/read-aloud'
import { useRef } from 'react'
import { voiceServiceUrl } from '../../lib/voice-service-url.ts'
import { useReadAloudTexts } from './texts.ts'

const voiceServiceName = 'Kvirn’s voice service'
const engine = kvirnSpeechEngine({ url: voiceServiceUrl, name: voiceServiceName })

export function CmsMarkers() {
  const { texts } = useReadAloudTexts()
  const containerRef = useRef<HTMLDivElement>(null)
  // A content management system writes plain HTML, so it can place the
  // KV:READ-ALOUD:START/STOP comments its own template engine cannot reach from React. Built
  // from this example's own texts, so the fixture text still lives in one place.
  const html = `
    <aside class="kv-read-aloud-cms-related">
      <h4>${texts.cms.relatedHeading}</h4>
      <p>${texts.cms.relatedText}</p>
    </aside>
    <!-- KV:READ-ALOUD:START -->
    <article>
      <h4>${texts.cms.title}</h4>
      <p>${texts.cms.paragraph1}</p>
      <p>${texts.cms.paragraph2}</p>
    </article>
    <!-- KV:READ-ALOUD:STOP -->
  `
  return (
    <>
      <ReadAloud.Root contentRef={containerRef} engine={engine} name={voiceServiceName}>
        <ReadAloud.Play />
        <ReadAloud.Status />
        <ReadAloud.Note howItWorksHref="/privacy#voice" />
      </ReadAloud.Root>
      {/* eslint-disable-next-line react/no-danger -- stands in for a CMS's own server-rendered HTML, markers included */}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
