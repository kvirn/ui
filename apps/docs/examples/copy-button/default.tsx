'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useCopyButtonTexts } from './texts.ts'

export function DefaultCopyButton() {
  const { texts, textLang } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  return (
    <p>
      <span lang={textLang} ref={numberRef}>
        {texts.referenceNumber}
      </span>{' '}
      <CopyButton text={texts.referenceNumber} textRef={numberRef} />
    </p>
  )
}
