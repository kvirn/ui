'use client'
import { CopyButton } from '@kvirn-ui/react'
import { useRef } from 'react'

export function ReferenceNumber({
  label,
  number,
  copy,
}: {
  label: string
  number: string
  copy: string
}) {
  const numberRef = useRef<HTMLSpanElement>(null)
  return (
    <>
      <p>
        {label} <span ref={numberRef}>{number}</span>.
      </p>
      <CopyButton text={number} textRef={numberRef}>
        {copy}
      </CopyButton>
    </>
  )
}
