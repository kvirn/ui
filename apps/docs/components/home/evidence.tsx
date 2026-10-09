'use client'
import { Heading, Link } from '@kvirn-ui/react'
import { homeMessages } from '../../messages/home.ts'
import { Band } from './band.tsx'

const text = homeMessages.evidence

/** The turn from feeling to proof: a dark band with the counts, each from its source. */
export function Evidence({
  componentCount,
  localeCount,
  dependencyCount,
}: {
  componentCount: number
  localeCount: number
  dependencyCount: number
}) {
  const counts = [
    [componentCount, text.counts.components],
    [localeCount, text.counts.languages],
    [text.themes, text.counts.themes],
    [dependencyCount, text.counts.dependencies],
    [text.trackers, text.counts.trackers],
  ] as const

  return (
    <Band tone="canvas" className="home-evidence" id="evidence">
      <Heading as="h2" size="heading-1" className="home-evidence-heading">
        {text.heading}
      </Heading>
      <p className="home-evidence-body">{text.body}</p>
      <ul className="home-counts" role="list" aria-label={text.countsLabel}>
        {counts.map(([value, label]) => (
          <li key={label}>
            <strong className="home-count">{value}</strong> {label}
          </li>
        ))}
      </ul>
      <div className="home-actions">
        <Link href="/components">{text.links.components}</Link>
        <Link href="/components/button">{text.links.contract}</Link>
        <Link href="/docs">{text.links.pending}</Link>
      </div>
    </Band>
  )
}
