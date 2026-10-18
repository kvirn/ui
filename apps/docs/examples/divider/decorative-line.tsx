'use client'
import { Divider } from '@kvirn-ui/react'
import { useDividerTexts } from './texts.ts'

export function DecorativeLine() {
  const { texts } = useDividerTexts()
  return (
    <>
      <p>{texts.contact}</p>
      <Divider role="presentation" />
      <p>{texts.footnote}</p>
    </>
  )
}
