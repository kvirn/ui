'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useCopyButtonTexts } from './texts.ts'

export function AllNumbers() {
  const { texts } = useCopyButtonTexts()
  const listRef = useRef<HTMLUListElement>(null)
  const numbers = [texts.referenceNumber, texts.secondReferenceNumber, texts.thirdReferenceNumber]
  return (
    <div>
      <p>{texts.yourCases}</p>
      <ul ref={listRef}>
        {numbers.map((number) => (
          <li key={number}>{number}</li>
        ))}
      </ul>
      <CopyButton text={() => numbers.join('\n')} textRef={listRef}>
        {texts.copyAll}
      </CopyButton>
    </div>
  )
}
