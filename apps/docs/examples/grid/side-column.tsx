'use client'
import { Card, Grid } from '@kvirn-ui/react'
import { useGridTexts } from './texts.ts'

export function SideColumn() {
  const { texts } = useGridTexts()
  return (
    <Grid.Root className="kv-grid--lg-cols-12 kv-grid--lg-gap-10">
      <Grid.Item className="kv-grid-item--lg-span-3">
        <Card.Root className="kv-prose">
          <p>{texts.side}</p>
        </Card.Root>
      </Grid.Item>
      <Grid.Item className="kv-grid-item--lg-span-9">
        <Card.Root className="kv-prose">
          <p>{texts.content}</p>
        </Card.Root>
      </Grid.Item>
    </Grid.Root>
  )
}
