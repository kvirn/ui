'use client'
import { Grid, Heading, Icon } from '@kvirn/ui'
import { mapIcons } from '@kvirn/map'
import { richTextIconNames, ToolbarIcon } from '@kvirn/rich-text'
import { useIconTexts } from './texts.ts'

export function PackageSets() {
  const { texts } = useIconTexts()
  return (
    <>
      <Heading as="h4">{texts.mapHeading}</Heading>
      <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
        {Object.entries(mapIcons).map(([name, icon]) => (
          <li key={name}>
            <Icon icon={icon} /> <code>{name}</code>
          </li>
        ))}
      </Grid.Root>
      <Heading as="h4">{texts.editorHeading}</Heading>
      <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
        {richTextIconNames.map((name) => (
          <li key={name}>
            <ToolbarIcon name={name} /> <code>{name}</code>
          </li>
        ))}
      </Grid.Root>
    </>
  )
}
