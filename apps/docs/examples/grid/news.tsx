'use client'
import { Card, Grid, Heading, Link } from '@kvirn-ui/react'
import { useGridTexts } from './texts.ts'

export function NewsGrid() {
  const { texts } = useGridTexts()
  const items = [texts.news.recycling, texts.news.snow]
  return (
    <Grid.Root className="kv-grid--fit-lg kv-grid--gap-8" as="ul">
      {items.map((item) => (
        <Card.Root key={item.title} as="li">
          <Card.Body className="kv-prose">
            <Heading as="h3">
              <Link href="#">{item.title}</Link>
            </Heading>
            <p>{item.excerpt}</p>
          </Card.Body>
        </Card.Root>
      ))}
    </Grid.Root>
  )
}
