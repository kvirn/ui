'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { useToolbarTexts } from './texts.ts'

export function Toggles() {
  const { texts } = useToolbarTexts()
  const sampleId = useId()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  let sample: ReactNode = texts.sampleText
  if (isUnderline) sample = <u>{sample}</u>
  if (isItalic) sample = <em>{sample}</em>
  if (isBold) sample = <strong>{sample}</strong>
  return (
    <div>
      <Toolbar.Root aria-label={texts.textStyle} aria-controls={sampleId}>
        <Toolbar.Toggle pressed={isBold} onPressedChange={setIsBold}>
          {texts.bold}
        </Toolbar.Toggle>
        <Toolbar.Toggle pressed={isItalic} onPressedChange={setIsItalic}>
          {texts.italic}
        </Toolbar.Toggle>
        <Toolbar.Toggle pressed={isUnderline} onPressedChange={setIsUnderline}>
          {texts.underline}
        </Toolbar.Toggle>
      </Toolbar.Root>
      <p id={sampleId}>{sample}</p>
    </div>
  )
}
