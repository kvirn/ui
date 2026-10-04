import { Heading, Markdown, useOf } from '@storybook/addon-docs/blocks'
import { splitUsageGuide } from '../src/docs-source.ts'
import type { UsageGuideParts } from '../src/docs-source.ts'
import type { ReactNode } from 'react'

// One part of the usage guide (`meta.parameters.docs.description.component`, from
// `usageGuide`) on the Docs page template: the lead above the main example, the `## API` body
// under the controls, and the notes before the examples (storybook-docs skill, "The Docs page
// template"). A meta without a usage guide (the Foundation pages) shows nothing.

/** The meta's usage guide, or `undefined`. */
function useUsageGuide(): string | undefined {
  const { preparedMeta } = useOf('meta', ['meta'])
  const docs: unknown = preparedMeta.parameters['docs']
  if (typeof docs !== 'object' || docs === null || !('description' in docs)) {
    return undefined
  }
  const description: unknown = docs.description
  if (typeof description !== 'object' || description === null || !('component' in description)) {
    return undefined
  }
  return typeof description.component === 'string' ? description.component : undefined
}

/** One part of the usage guide, or nothing when it is empty. */
export function UsageSection({ part }: { part: keyof UsageGuideParts }) {
  const guide = useUsageGuide()
  const text = guide === undefined ? '' : splitUsageGuide(guide)[part]
  return text === '' ? null : <Markdown>{text}</Markdown>
}

/** The API section: its heading, the controls (passed in) and the guide's `## API` body. */
export function ApiSection({ children }: { children: ReactNode }) {
  return (
    <>
      <Heading>API</Heading>
      {children}
      <UsageSection part="api" />
    </>
  )
}
