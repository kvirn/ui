'use client'
import { VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function HiddenHeading() {
  const { texts, textLang } = useVisuallyHiddenTexts()
  return (
    <div lang={textLang}>
      <VisuallyHidden render={(props) => <h4 {...props}>{texts.openingHours}</h4>} />
      <p>{texts.openingHoursText}</p>
    </div>
  )
}
