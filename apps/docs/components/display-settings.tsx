'use client'
import type { ColorSchemePreference, ContrastPreference, MotionPreference } from '@kvirn-ui/core'
import {
  AlertBody,
  AlertInfo,
  AlertTitle,
  Card,
  Disclosure,
  Field,
  Listbox,
  RadioGroup,
  useTheme,
} from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'
import { exampleLocales, useExampleLocale } from './example-locale.tsx'

const text = messages.docs.display
const languageNames = messages.docs.example.languages
const colorSchemeOptions: readonly ColorSchemePreference[] = ['light', 'dark', 'system']
const contrastOptions: readonly ContrastPreference[] = ['standard', 'more', 'system']
const motionOptions: readonly MotionPreference[] = ['full', 'reduce', 'system']

/**
 * The theme switcher: three radio groups on `useTheme()`, as in the KvirnProvider recipe, and the
 * language every example is shown in. The checked radio or selected option is the only feedback:
 * nothing is announced and focus stays.
 */
export function DisplaySettingsPanel() {
  const theme = useTheme()
  const { locale, selectLocale } = useExampleLocale()

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
            <RadioGroup.Root
              name="docs-motion"
              value={theme.motion}
              onValueChange={(value) => {
                const option = motionOptions.find((candidate) => candidate === value)
                if (option !== undefined) {
                  theme.selectMotion(option)
                }
              }}
            >
              <RadioGroup.Legend marker="none">{text.motion.legend}</RadioGroup.Legend>
              {motionOptions.map((option) => (
                <Field.Root key={option}>
                  <RadioGroup.Radio value={option} />
                  <Field.Label>{text.motion[option]}</Field.Label>
                </Field.Root>
              ))}
            </RadioGroup.Root>
            <Field.Root>
              <Field.Label marker="none">{text.exampleLanguage}</Field.Label>
              <Listbox.Root
                native="always"
                items={exampleLocales}
                itemToString={(code) => languageNames[code]}
                itemToKey={(code) => code}
                itemToLang={(code) => code}
                value={locale}
                onValueChange={(value) => {
                  const option = exampleLocales.find((candidate) => candidate === value)
                  if (option !== undefined) {
                    selectLocale(option)
                  }
                }}
              />
            </Field.Root>
          </div>
        </Card.Body>
        <Card.Footer>
          <div>
            {theme.isForcedColors && <p>{text.forcedColors}</p>}
            <p>{text.motion.note}</p>
            <AlertInfo>
              <AlertTitle as="p">{text.storageTitle}</AlertTitle>
              <AlertBody>
                <p>{text.storageNote}</p>
              </AlertBody>
            </AlertInfo>
          </div>
        </Card.Footer>
      </Card.Root>
    </Disclosure.Panel>
  )
}
