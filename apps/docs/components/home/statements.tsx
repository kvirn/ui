'use client'
import { Heading, Link } from '@kvirn-ui/react'
import { homeMessages } from '../../messages/home.ts'
import { Band } from './band.tsx'

const edges = homeMessages.edges
const why = homeMessages.why

export function Edges() {
  return (
    <Band tone="surface">
      <div className="home-statement-grid">
        <Heading as="h2" size="heading-1" className="home-statement-title">
          {edges.titleFirst}
          <br />
          <strong>{edges.titleSecond}</strong>
        </Heading>
        <div>
          <p className="home-statement-text">{edges.body}</p>
          <p className="home-statement-close">
            {edges.closeFirst} <strong>{edges.closeSecond}</strong>
          </p>
        </div>
      </div>
    </Band>
  )
}

export function Why() {
  return (
    <Band tone="canvas" id="why-we-build-it">
      <p className="home-kicker">{why.kicker}</p>
      <Heading as="h2" size="heading-1" className="home-statement-title home-statement-title--wide">
        {why.titleFirst} <strong>{why.titleSecond}</strong>
      </Heading>
      <div className="home-statement-grid">
        <p className="home-big">{why.big}</p>
        <div className="home-prose">
          <p>{why.ours}</p>
          <p className="home-honesty">{why.honest}</p>
          <div className="home-actions">
            <Link href="#evidence">{why.links.evidence}</Link>
            <Link href="#start">{why.links.start}</Link>
            <Link href="#contact">{why.links.contact}</Link>
          </div>
        </div>
      </div>
    </Band>
  )
}
