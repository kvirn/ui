'use client'
import { Heading, Icon, Link, LinkIcon } from '@kvirn-ui/react'
import { homeMessages } from '../../messages/home.ts'
import { Band } from './band.tsx'

const text = homeMessages.hero

export function Hero() {
  return (
    <Band tone="canvas" className="home-hero">
      <p className="home-kicker">{text.kicker}</p>
      <Heading as="h1" size="display" className="home-title">
        <span className="home-title-line">{text.titleFirst}</span>{' '}
        <span className="home-title-line">{text.titleSecond}</span>
      </Heading>
      <p className="home-promise">{text.promise}</p>
      <div className="home-actions">
        <Link href="/docs" className="kv-link--service">
          <LinkIcon>
            <Icon name="arrow-forward" size="24" />
          </LinkIcon>
          {text.start}
        </Link>
        <Link href="#who">{text.who}</Link>
      </div>
      <p className="home-honest">{text.honest}</p>
    </Band>
  )
}
