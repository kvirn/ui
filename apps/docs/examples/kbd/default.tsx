'use client'
import { Kbd } from '@kvirn-ui/react'
import { useKbdTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultKbd() {
  const { texts, isFallback } = useKbdTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        {texts.moveBetweenFields} <Kbd>Tab</Kbd>.
      </p>
    </InEnglishWhenFallback>
  )
}
