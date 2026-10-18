'use client'
import { Divider, Heading } from '@kvirn-ui/react'
import type { CSSProperties } from 'react'
import { useDividerTexts } from './texts.ts'

// Set these in your own stylesheet, on a class. They are on the line here so the example runs on its own.
const strongerLine = {
  '--kv-divider-width': '2px',
  '--kv-divider-color': 'var(--kv-color-border-control)',
} as CSSProperties

export function StrongerLine() {
  const { texts } = useDividerTexts()
  return (
    <>
      <Heading as="h4">{texts.decisionHeading}</Heading>
      <p>{texts.decision}</p>
      <Divider style={strongerLine} />
      <Heading as="h4">{texts.nextStepsHeading}</Heading>
      <p>{texts.nextSteps}</p>
    </>
  )
}
