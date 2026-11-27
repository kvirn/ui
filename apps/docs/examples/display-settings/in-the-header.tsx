'use client'
import { DisplaySettings } from '@kvirn/ui'
import { useDisplaySettingsTexts } from './texts.ts'

export function InTheHeader() {
  const { texts } = useDisplaySettingsTexts()
  return (
    <>
      <p>
        <strong>{texts.siteName}</strong>
      </p>
      <DisplaySettings.Floating />
      <p>{texts.staysPut}</p>
    </>
  )
}
