'use client'
import { Kbd } from '@kvirn-ui/react'
import { useKbdTexts } from './texts.ts'

export function DefaultKbd() {
  const { texts, textLang } = useKbdTexts()
  return (
    <p lang={textLang}>
      {texts.moveBetweenFields} <Kbd lang="en">Tab</Kbd>.
    </p>
  )
}
