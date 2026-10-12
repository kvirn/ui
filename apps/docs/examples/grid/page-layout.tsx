'use client'
import { Card, Grid, Heading } from '@kvirn-ui/react'
import { useGridTexts } from './texts.ts'

export function PageLayout() {
  const { texts } = useGridTexts()
  return (
    <Grid.Root className="kv-grid--cols-1 kv-grid--lg-cols-12">
      <Grid.Item className="kv-grid-item--lg-span-8">
        <Card.Root className="kv-prose">
          <Heading as="h3">{texts.layout.main.title}</Heading>
          <p>{texts.layout.main.text}</p>
        </Card.Root>
      </Grid.Item>
      <Grid.Item className="kv-grid-item--lg-span-4">
        <Card.Root className="kv-prose">
          <Heading as="h3">{texts.layout.contact.title}</Heading>
          <p>{texts.layout.contact.text}</p>
        </Card.Root>
      </Grid.Item>
    </Grid.Root>
  )
}
