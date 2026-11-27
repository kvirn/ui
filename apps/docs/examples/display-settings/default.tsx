'use client'
import { DisplaySettings } from '@kvirn/ui'
import { useDisplaySettingsTexts } from './texts.ts'

export function DefaultDisplaySettings() {
  const { texts } = useDisplaySettingsTexts()
  return (
    <>
      <DisplaySettings.Inline />
      <p>{texts.movesDown}</p>
    </>
  )
}
