'use client'
import type { ColorSchemePreference, ContrastPreference } from '@kvirn-ui/core'
import { useTheme } from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'

const text = messages.docs.display
const colorSchemeOptions: readonly ColorSchemePreference[] = ['light', 'dark', 'system']
const contrastOptions: readonly ContrastPreference[] = ['standard', 'more', 'system']

/**
 * The theme switcher: two native radio groups on `useTheme()`, as in the KvirnProvider
 * recipe. The checked radio is the only feedback: nothing is announced and focus stays.
 */
export function DisplaySettingsPanel({ id, isOpen }: { id: string; isOpen: boolean }) {
  const theme = useTheme()
  const inUse = text.inUse({
    colorScheme: theme.resolvedColorScheme,
    contrast: theme.resolvedContrast === 'more' ? 'high' : 'standard',
  })

  return (
    <div id={id} className="docs-display-panel" hidden={!isOpen}>
      <div className="docs-display-fieldsets">
        <fieldset className="docs-fieldset">
          <legend>{text.colorScheme.legend}</legend>
          {colorSchemeOptions.map((option) => (
            <label key={option} className="docs-radio">
              <input
                type="radio"
                name="docs-color-scheme"
                value={option}
                checked={theme.colorScheme === option}
                onChange={() => theme.selectColorScheme(option)}
              />
              {text.colorScheme[option]}
            </label>
          ))}
        </fieldset>
        <fieldset className="docs-fieldset">
          <legend>{text.contrast.legend}</legend>
          {contrastOptions.map((option) => (
            <label key={option} className="docs-radio">
              <input
                type="radio"
                name="docs-contrast"
                value={option}
                checked={theme.contrast === option}
                onChange={() => theme.selectContrast(option)}
              />
              {text.contrast[option]}
            </label>
          ))}
        </fieldset>
      </div>
      <p className="docs-display-status">{theme.isForcedColors ? text.forcedColors : inUse}</p>
      <p className="docs-display-note">{text.storageNote}</p>
    </div>
  )
}
