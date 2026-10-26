'use client'
import { kvirnSpeechEngine } from '@kvirn-ui/core'
import { Heading, Link, Navigation } from '@kvirn-ui/react'
import { ReadAloud } from '@kvirn-ui/read-aloud'
import { voiceServiceUrl } from '../../lib/voice-service-url.ts'
import { useReadAloudTexts } from './texts.ts'

// Built once, outside the component: a site-wide Bar is mounted once in a real layout, so its
// engine is built once too.
const voiceServiceName = 'Kvirn’s voice service'
const engine = kvirnSpeechEngine({ url: voiceServiceUrl, name: voiceServiceName })

export function BarLayout() {
  const { texts } = useReadAloudTexts()
  return (
    <div className="kv-read-aloud-bar-demo">
      {/* No contentRef: the Bar reads whatever matches `scope`, so one include in a layout works
       * for every page without per-article wiring. */}
      <ReadAloud.Root
        engine={engine}
        name={voiceServiceName}
        scope=".kv-read-aloud-bar-demo-article"
      >
        <ReadAloud.Bar howItWorksHref="/privacy#voice" />
      </ReadAloud.Root>
      <Navigation.Root label={texts.barDemo.navLabel} className="kv-navigation--horizontal">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#home">{texts.barDemo.navHome}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#services">{texts.barDemo.navServices}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#contact">{texts.barDemo.navContact}</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
      <article className="kv-read-aloud-bar-demo-article">
        <Heading as="h4">{texts.barDemo.title}</Heading>
        <p>{texts.barDemo.paragraph}</p>
      </article>
    </div>
  )
}
