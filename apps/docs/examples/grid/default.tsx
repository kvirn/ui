'use client'
import { Card, Grid, Heading } from '@kvirn-ui/react'
import { useGridTexts } from './texts.ts'

export function DefaultGrid() {
  const { texts } = useGridTexts()
  const services = [texts.services.waste, texts.services.school, texts.services.housing]
  return (
    <Grid.Root className="kv-grid--fit-md">
      {services.map((service) => (
        <Card.Root key={service.title} className="kv-prose">
          <Heading as="h3">{service.title}</Heading>
          <p>{service.text}</p>
        </Card.Root>
      ))}
    </Grid.Root>
  )
}
