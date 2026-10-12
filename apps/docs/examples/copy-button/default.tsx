'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useCopyButtonTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultCopyButton() {
  const { texts, isFallback } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        <span ref={numberRef}>{texts.referenceNumber}</span>{' '}
        <CopyButton text={texts.referenceNumber} textRef={numberRef} />
      </p>
    </InEnglishWhenFallback>
  )
}
