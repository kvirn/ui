'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useCopyButtonTexts } from './texts.ts'

function CaseRow({ title, number }: { title: string; number: string }) {
  const { texts } = useCopyButtonTexts()
  const numberRef = useRef<HTMLElement>(null)
  return (
    <li>
      {title}, {texts.caseNumber} <strong ref={numberRef}>{number}</strong>{' '}
      <CopyButton text={number} textRef={numberRef} aria-label={texts.copyNamed(number)} />
    </li>
  )
}

export function Several() {
  const { texts } = useCopyButtonTexts()
  return (
    <ul>
      <CaseRow title={texts.buildingPermit} number={texts.referenceNumber} />
      <CaseRow title={texts.parkingPermit} number={texts.secondReferenceNumber} />
    </ul>
  )
}
