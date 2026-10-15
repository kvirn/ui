'use client'
import { Grid, Icon } from '@kvirn-ui/react'
import { mapIcons } from '@kvirn-ui/map'

export function MapSet() {
  return (
    <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
      {Object.entries(mapIcons).map(([name, icon]) => (
        <li key={name}>
          <Icon icon={icon} /> <code>{name}</code>
        </li>
      ))}
    </Grid.Root>
  )
}
