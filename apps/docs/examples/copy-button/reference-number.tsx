'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useCopyButtonTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ReferenceNumber() {
  const { texts, isFallback } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        {texts.yourNumber} <strong ref={numberRef}>{texts.referenceNumber}</strong>{' '}
        <CopyButton text={texts.referenceNumber} textRef={numberRef}>
          {texts.copyNumber}
        </CopyButton>
      </p>
    </InEnglishWhenFallback>
  )
}
