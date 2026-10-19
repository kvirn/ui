'use client'
import { Field, RadioGroup, useTheme } from '@kvirn-ui/react'
import { useKvirnProviderTexts } from './texts.ts'

const colorSchemes = ['system', 'light', 'dark'] as const
const contrasts = ['system', 'standard', 'more'] as const

export function ThemeSwitcher() {
  const { texts } = useKvirnProviderTexts()
  const theme = useTheme()
  return (
    <div>
      <RadioGroup.Root
        name="color-scheme"
        value={theme.colorScheme}
        onValueChange={(value) => {
          const choice = colorSchemes.find((option) => option === value)
          if (choice !== undefined) {
            theme.selectColorScheme(choice)
          }
        }}
      >
        <RadioGroup.Legend>{texts.colorScheme}</RadioGroup.Legend>
        {colorSchemes.map((option) => (
          <RadioGroup.Option key={option}>
            <RadioGroup.Radio value={option} />
            <Field.Label>{texts[option]}</Field.Label>
          </RadioGroup.Option>
        ))}
      </RadioGroup.Root>
      <RadioGroup.Root
        name="contrast"
        value={theme.contrast}
        onValueChange={(value) => {
          const choice = contrasts.find((option) => option === value)
          if (choice !== undefined) {
            theme.selectContrast(choice)
          }
        }}
      >
        <RadioGroup.Legend>{texts.contrast}</RadioGroup.Legend>
        {contrasts.map((option) => (
          <RadioGroup.Option key={option}>
            <RadioGroup.Radio value={option} />
            <Field.Label>{texts[option]}</Field.Label>
          </RadioGroup.Option>
        ))}
      </RadioGroup.Root>
      {theme.isForcedColors ? <p>{texts.forcedColors}</p> : null}
    </div>
  )
}
