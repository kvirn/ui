'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useCopyButtonTexts } from './texts.ts'

export function ReferenceNumber() {
  const { texts, textLang } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  return (
    <p lang={textLang}>
      {texts.yourNumber} <strong ref={numberRef}>{texts.referenceNumber}</strong>{' '}
      <CopyButton text={texts.referenceNumber} textRef={numberRef} lang={textLang}>
        {texts.copyNumber}
      </CopyButton>
    </p>
  )
}
