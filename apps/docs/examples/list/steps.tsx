'use client'
import { Heading, List } from '@kvirn-ui/react'
import { useId } from 'react'
import { useListTexts } from './texts.ts'

export function Steps() {
  const { texts } = useListTexts()
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <Heading as="h4" id={headingId}>
        {texts.stepsHeading}
      </Heading>
      <List.Root as="ol" className="kv-list--decimal">
        <List.Item>{texts.stepApply}</List.Item>
        <List.Item>{texts.stepAttach}</List.Item>
        <List.Item>{texts.stepWait}</List.Item>
      </List.Root>
    </section>
  )
}
