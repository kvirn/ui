'use client'
import { Grid, Heading, Link } from '@kvirn-ui/react'
import { useGridTexts } from './texts.ts'

export function ServicePage() {
  const { texts } = useGridTexts()
  const { service } = texts
  return (
    <Grid.Root className="kv-grid--lg-cols-12 kv-grid--lg-gap-10">
      <Grid.Item as="nav" aria-label={service.navigationLabel} className="kv-grid-item--lg-span-3">
        <ul className="kv-stack kv-stack--gap-2">
          {service.links.map((label) => (
            <li key={label}>
              <Link href="#" aria-current={label === service.current ? 'page' : undefined}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Grid.Item>
      <Grid.Item className="kv-grid-item--lg-span-9 kv-prose">
        <Heading as="h3">{service.heading}</Heading>
        <p>{service.text}</p>
      </Grid.Item>
    </Grid.Root>
  )
}
