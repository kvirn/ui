'use client'
import { Grid, Link } from '@kvirn-ui/react'
import { useGridTexts } from './texts.ts'

export function QuickLinks() {
  const { texts } = useGridTexts()
  const links = Object.values(texts.quickLinks)
  return (
    <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
      {links.map((label) => (
        <li key={label}>
          <Link href="#">{label}</Link>
        </li>
      ))}
    </Grid.Root>
  )
}
