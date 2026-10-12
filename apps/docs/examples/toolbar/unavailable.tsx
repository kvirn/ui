'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Unavailable() {
  const { texts, isFallback } = useToolbarTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Toolbar.Root aria-label={texts.history}>
        <Toolbar.Button>{texts.undo}</Toolbar.Button>
        <Toolbar.Button disabled>{texts.redo}</Toolbar.Button>
        <Toolbar.Button>{texts.link}</Toolbar.Button>
      </Toolbar.Root>
    </InEnglishWhenFallback>
  )
}
