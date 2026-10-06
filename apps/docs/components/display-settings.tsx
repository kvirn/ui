'use client'
import type { ColorSchemePreference, ContrastPreference } from '@kvirn-ui/core'
import { Card, Disclosure, Field, RadioGroup, useTheme } from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'

const text = messages.docs.display
const colorSchemeOptions: readonly ColorSchemePreference[] = ['light', 'dark', 'system']
const contrastOptions: readonly ContrastPreference[] = ['standard', 'more', 'system']

/**
 * The theme switcher: two radio groups on `useTheme()`, as in the KvirnProvider recipe. The
 * checked radio is the only feedback: nothing is announced and focus stays.
 */
export function DisplaySettingsPanel() {
  const theme = useTheme()
  const inUse = text.inUse({
    colorScheme: theme.resolvedColorScheme,
    contrast: theme.resolvedContrast === 'more' ? 'high' : 'standard',
  })

  return (
    <Disclosure.Panel className="docs-display">
      <Card.Root>
        <Card.Body>
          <div className="docs-display-groups">
            <RadioGroup.Root
              name="docs-color-scheme"
              value={theme.colorScheme}
              onValueChange={(value) => {
                const option = colorSchemeOptions.find((candidate) => candidate === value)
                if (option !== undefined) {
                  theme.selectColorScheme(option)
                }
              }}
            >
              <RadioGroup.Legend marker="none">{text.colorScheme.legend}</RadioGroup.Legend>
              {colorSchemeOptions.map((option) => (
                <Field.Root key={option}>
                  <RadioGroup.Radio value={option} />
                  <Field.Label>{text.colorScheme[option]}</Field.Label>
                </Field.Root>
              ))}
            </RadioGroup.Root>
            <RadioGroup.Root
              name="docs-contrast"
              value={theme.contrast}
              onValueChange={(value) => {
                const option = contrastOptions.find((candidate) => candidate === value)
                if (option !== undefined) {
                  theme.selectContrast(option)
                }
              }}
            >
              <RadioGroup.Legend marker="none">{text.contrast.legend}</RadioGroup.Legend>
              {contrastOptions.map((option) => (
                <Field.Root key={option}>
                  <RadioGroup.Radio value={option} />
                  <Field.Label>{text.contrast[option]}</Field.Label>
                </Field.Root>
              ))}
            </RadioGroup.Root>
          </div>
        </Card.Body>
        <Card.Footer>
          <div>
            <p>{theme.isForcedColors ? text.forcedColors : inUse}</p>
            <p>{text.storageNote}</p>
          </div>
        </Card.Footer>
      </Card.Root>
    </Disclosure.Panel>
  )
}
