'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useCopyButtonTexts } from './texts.ts'

export function ReferenceNumber() {
  const { texts } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  return (
    <p>
      {texts.yourNumber} <strong ref={numberRef}>{texts.referenceNumber}</strong>{' '}
      <CopyButton text={texts.referenceNumber} textRef={numberRef}>
        {texts.copyNumber}
      </CopyButton>
    </p>
  )
}
