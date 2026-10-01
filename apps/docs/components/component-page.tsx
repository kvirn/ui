import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { PageHeading } from './page-heading.tsx'

const text = messages.docs.status

export type ComponentStatus = 'planned' | 'alpha' | 'beta' | 'stable'

const statusTexts: Record<ComponentStatus, string> = {
  planned: text.plannedText,
  alpha: text.alphaText,
  beta: text.betaText,
  stable: text.stableText,
}

/** The status as a badge plus words, never colour alone (docs-site.md §6). */
export function StatusLine({ status }: { status: ComponentStatus }) {
  return (
    <div className="docs-status">
      <span className="docs-badge">
        <span className="docs-visually-hidden">{text.label}: </span>
        {text[status]}
      </span>
      <p>{statusTexts[status]}</p>
    </div>
  )
}

/**
 * The component page template: h1, summary and status, then the page's sections
 * (docs-site.md §4 and §5). Phase 1 renders the sections the page writes itself.
 */
export function ComponentPage({
  title,
  summary,
  status,
  children,
}: {
  title: string
  summary: string
  status: ComponentStatus
  children: ReactNode
}) {
  return (
    <>
      <PageHeading>{title}</PageHeading>
      <p data-kv-lead>{summary}</p>
      <StatusLine status={status} />
      {children}
    </>
  )
}
