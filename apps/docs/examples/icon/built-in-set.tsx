'use client'
import { Grid, Icon } from '@kvirn-ui/react'
import type { BuiltInIconName } from '@kvirn-ui/react'

const names: BuiltInIconName[] = [
  'chevron-down',
  'chevron-up',
  'chevron-back',
  'chevron-forward',
  'arrow-back',
  'arrow-forward',
  'external',
  'close',
  'menu',
  'search',
  'add',
  'check',
  'info',
  'success',
  'warning',
  'error',
  'calendar',
  'upload',
  'download',
  'document',
  'delete',
  'language',
  'eye',
  'eye-off',
]

export function BuiltInSet() {
  return (
    <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
      {names.map((name) => (
        <li key={name}>
          <Icon name={name} /> <code>{name}</code>
        </li>
      ))}
    </Grid.Root>
  )
}
