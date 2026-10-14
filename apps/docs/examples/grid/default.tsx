'use client'
import { Card, Grid, Heading, Link } from '@kvirn-ui/react'
import { useGridTexts } from './texts.ts'

export function DefaultGrid() {
  const { texts } = useGridTexts()
  const services = [texts.services.waste, texts.services.school, texts.services.housing]
  return (
    <Grid.Root className="kv-grid--fit-md" as="ul">
      {services.map((service) => (
        <Card.Root key={service.title} as="li">
          <Card.Body className="kv-prose">
            <Heading as="h3">
              <Link href="#">{service.title}</Link>
            </Heading>
            <p>{service.text}</p>
          </Card.Body>
        </Card.Root>
      ))}
    </Grid.Root>
  )
}
