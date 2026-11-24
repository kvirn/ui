'use client'
import { Kbd } from '@kvirn/ui'
import { useKbdTexts } from './texts.ts'

export function DefaultKbd() {
  const { texts } = useKbdTexts()
  return (
    <p>
      {texts.moveBetweenFields} <Kbd>Tab</Kbd>.
    </p>
  )
}
