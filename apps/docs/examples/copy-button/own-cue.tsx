'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useCopyButtonTexts } from './texts.ts'

export function OwnCue() {
  const { texts } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  const [isCopied, setIsCopied] = useState(false)
  return (
    <p>
      {texts.yourNumber} <strong ref={numberRef}>{texts.referenceNumber}</strong>{' '}
      <CopyButton
        text={texts.referenceNumber}
        textRef={numberRef}
        onCopied={() => setIsCopied(true)}
      >
        {texts.copyNumber}
      </CopyButton>
      {isCopied ? <span> {texts.copiedCue}</span> : null}
    </p>
  )
}
