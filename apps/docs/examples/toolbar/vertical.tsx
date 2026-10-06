'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'

export function Vertical() {
  const { texts, textLang } = useToolbarTexts()
  return (
    <Toolbar.Root
      aria-label={texts.rowActions}
      orientation="vertical"
      lang={textLang}
      style={{ flexDirection: 'column', alignItems: 'flex-start' }}
    >
      <Toolbar.Button>{texts.moveUp}</Toolbar.Button>
      <Toolbar.Button>{texts.moveDown}</Toolbar.Button>
      <Toolbar.Button>{texts.duplicate}</Toolbar.Button>
      <Toolbar.Button>{texts.remove}</Toolbar.Button>
    </Toolbar.Root>
  )
}
