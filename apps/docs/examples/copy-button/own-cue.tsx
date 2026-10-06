'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useCopyButtonTexts } from './texts.ts'

export function OwnCue() {
  const { texts, textLang } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  const [isCopied, setIsCopied] = useState(false)
  return (
    <p lang={textLang}>
      {texts.yourNumber} <strong ref={numberRef}>{texts.referenceNumber}</strong>{' '}
      <CopyButton
        text={texts.referenceNumber}
        textRef={numberRef}
        lang={textLang}
        onCopied={() => setIsCopied(true)}
      >
        {texts.copyNumber}
      </CopyButton>
      {isCopied ? <span> {texts.copiedCue}</span> : null}
    </p>
  )
}
