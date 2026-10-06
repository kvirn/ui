'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useToolbarTexts } from './texts.ts'

export function Toggles() {
  const { texts, textLang } = useToolbarTexts()
  const sampleId = useId()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  return (
    <div lang={textLang}>
      <Toolbar.Root aria-label={texts.textStyle} aria-controls={sampleId}>
        <Toolbar.Toggle pressed={isBold} onPressedChange={setIsBold}>
          {texts.bold}
        </Toolbar.Toggle>
        <Toolbar.Toggle pressed={isItalic} onPressedChange={setIsItalic}>
          {texts.italic}
        </Toolbar.Toggle>
        <Toolbar.Toggle>{texts.underline}</Toolbar.Toggle>
      </Toolbar.Root>
      <p
        id={sampleId}
        style={{ fontWeight: isBold ? 700 : 400, fontStyle: isItalic ? 'italic' : 'normal' }}
      >
        {texts.sampleText}
      </p>
    </div>
  )
}
