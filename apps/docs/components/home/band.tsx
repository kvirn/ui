'use client'
// A client component like SiteShell: a `render` element passed from a Server Component
// is dropped on the client, so the server's <section> hydrated against a <div>.
import { Container, Section, Stack } from '@kvirn-ui/react'
import type { ReactNode } from 'react'

/** A full-width band of the landing page. Unnamed on purpose: its heading carries the outline. */
export function Band({
  tone,
  className,
  id,
  children,
}: {
  tone: 'canvas' | 'surface'
  className?: string | undefined
  id?: string | undefined
  children: ReactNode
}) {
  return (
    <Section
      as="section"
      id={id}
      className={`home-band kv-section--${tone} kv-section--padding-lg ${className ?? ''}`.trim()}
    >
      <Container>
        <Stack gap="8">{children}</Stack>
      </Container>
    </Section>
  )
}
