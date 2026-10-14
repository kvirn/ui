'use client'
import { Kbd } from '@kvirn-ui/react'
import { useKbdTexts } from './texts.ts'

export function PerSystem() {
  const { texts } = useKbdTexts()
  return (
    <p>
      {texts.printApplication}{' '}
      <Kbd>
        <Kbd>Ctrl</Kbd>+<Kbd>P</Kbd>
      </Kbd>
      . {texts.onAMac}{' '}
      <Kbd>
        <Kbd>Cmd</Kbd>+<Kbd>P</Kbd>
      </Kbd>
      .
    </p>
  )
}
