'use client'
import { Grid, Heading, Icon, KvirnProvider } from '@kvirn/ui'
import type { IconName } from '@kvirn/ui'
import { mapIcons } from '@kvirn/map'
import { richTextIconNames, ToolbarIcon } from '@kvirn/rich-text'
import { useIconTexts } from './texts.ts'

export function PackageSets() {
  const { texts } = useIconTexts()
  return (
    <>
      <Heading as="h4">{texts.mapHeading}</Heading>
      <KvirnProvider icons={mapIcons}>
        <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
          {(Object.keys(mapIcons) as IconName[]).map((name) => (
            <li key={name}>
              <Icon name={name} /> <code>{name}</code>
            </li>
          ))}
        </Grid.Root>
      </KvirnProvider>
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
