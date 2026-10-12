'use client'
import { Kbd } from '@kvirn-ui/react'
import { useKbdTexts } from './texts.ts'

export function Combination() {
  const { texts } = useKbdTexts()
  return (
    <p>
      {texts.copy}{' '}
      <Kbd>
        <Kbd>Ctrl</Kbd>+<Kbd>C</Kbd>
      </Kbd>
      .
    </p>
  )
}
