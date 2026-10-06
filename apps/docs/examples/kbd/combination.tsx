'use client'
import { Kbd } from '@kvirn-ui/react'
import { useKbdTexts } from './texts.ts'

export function Combination() {
  const { texts, textLang } = useKbdTexts()
  return (
    <p lang={textLang}>
      {texts.copy}{' '}
      <Kbd>
        <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">C</Kbd>
      </Kbd>
      .
    </p>
  )
}
