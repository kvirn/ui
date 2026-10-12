'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Vertical() {
  const { texts, isFallback } = useToolbarTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Toolbar.Root
        aria-label={texts.rowActions}
        orientation="vertical"
        style={{ flexDirection: 'column', alignItems: 'flex-start' }}
      >
        <Toolbar.Button>{texts.moveUp}</Toolbar.Button>
        <Toolbar.Button>{texts.moveDown}</Toolbar.Button>
        <Toolbar.Button>{texts.duplicate}</Toolbar.Button>
        <Toolbar.Button>{texts.remove}</Toolbar.Button>
      </Toolbar.Root>
    </InEnglishWhenFallback>
  )
}
