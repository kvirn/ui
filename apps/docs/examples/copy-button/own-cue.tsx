'use client'
import { useCopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useCopyButtonTexts } from './texts.ts'

export function OwnCue() {
  const { texts } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  const copy = useCopyButton({
    text: texts.referenceNumber,
    textRef: numberRef,
    messages: { label: texts.copyNumber, copied: texts.copiedCue, failed: texts.failedCue },
  })
  return (
    <p>
      {texts.yourNumber} <strong ref={numberRef}>{texts.referenceNumber}</strong>{' '}
      <button {...copy.buttonProps}>{copy.label}</button>
      {copy.status === 'copied' ? <span> {texts.copiedCue}</span> : null}
      {copy.status === 'failed' ? <span> {texts.failedCue}</span> : null}
    </p>
  )
}
