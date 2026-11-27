'use client'
import { Card, DisplaySettings, Heading } from '@kvirn/ui'
import { useDisplaySettingsTexts } from './texts.ts'

export function SettingsPage() {
  const { texts } = useDisplaySettingsTexts()
  return (
    <Card.Root>
      <Card.Header>
        <Heading as="h4">{texts.settingsHeading}</Heading>
      </Card.Header>
      <Card.Body>
        <DisplaySettings.Panel>
          <p>{texts.savedNote}</p>
        </DisplaySettings.Panel>
      </Card.Body>
    </Card.Root>
  )
}
