'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'

export function Unavailable() {
  const { texts, textLang } = useToolbarTexts()
  return (
    <Toolbar.Root aria-label={texts.history} lang={textLang}>
      <Toolbar.Button>{texts.undo}</Toolbar.Button>
      <Toolbar.Button disabled>{texts.redo}</Toolbar.Button>
      <Toolbar.Button>{texts.link}</Toolbar.Button>
    </Toolbar.Root>
  )
}
