'use client'
import { Grid } from '@kvirn-ui/react'
import { richTextIconNames, ToolbarIcon } from '@kvirn-ui/rich-text'

export function RichTextSet() {
  return (
    <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
      {richTextIconNames.map((name) => (
        <li key={name}>
          <ToolbarIcon name={name} /> <code>{name}</code>
        </li>
      ))}
    </Grid.Root>
  )
}
