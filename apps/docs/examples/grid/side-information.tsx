'use client'
import { Card, Grid, Heading } from '@kvirn-ui/react'
import { useId } from 'react'
import { useGridTexts } from './texts.ts'

export function SideInformation() {
  const { texts } = useGridTexts()
  const headingId = useId()
  return (
    <Grid.Root className="kv-grid--lg-cols-12 kv-grid--lg-gap-10">
      <Grid.Item className="kv-grid-item--lg-span-9 kv-prose">
        <Heading as="h3">{texts.contact.article}</Heading>
        <p>{texts.contact.articleText}</p>
      </Grid.Item>
      <Grid.Item as="aside" aria-labelledby={headingId} className="kv-grid-item--lg-span-3">
        <Card.Root className="kv-prose">
          <Heading as="h4" id={headingId}>
            {texts.contact.heading}
          </Heading>
          <p>{texts.contact.text}</p>
        </Card.Root>
      </Grid.Item>
    </Grid.Root>
  )
}
