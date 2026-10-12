'use client'
import { Kbd } from '@kvirn-ui/react'
import { useKbdTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Combination() {
  const { texts, isFallback } = useKbdTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        {texts.copy}{' '}
        <Kbd>
          <Kbd>Ctrl</Kbd>+<Kbd>C</Kbd>
        </Kbd>
        .
      </p>
    </InEnglishWhenFallback>
  )
}
