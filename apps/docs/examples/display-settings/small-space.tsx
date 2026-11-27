'use client'
import { DisplaySettings } from '@kvirn/ui'
import { useDisplaySettingsTexts } from './texts.ts'

export function SmallSpace() {
  const { texts } = useDisplaySettingsTexts()
  return <DisplaySettings.Compact messages={{ button: texts.appearance }} />
}
