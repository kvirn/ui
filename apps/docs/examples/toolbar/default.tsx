'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'

export function DefaultToolbar() {
  const { texts, textLang } = useToolbarTexts()
  return (
    <Toolbar.Root aria-label={texts.formatting} lang={textLang}>
      <Toolbar.Group aria-label={texts.history}>
        <Toolbar.Button>{texts.undo}</Toolbar.Button>
        <Toolbar.Button>{texts.redo}</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Group aria-label={texts.textStyle}>
        <Toolbar.Toggle defaultPressed>{texts.bold}</Toolbar.Toggle>
        <Toolbar.Toggle>{texts.italic}</Toolbar.Toggle>
        <Toolbar.Toggle>{texts.underline}</Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Group aria-label={texts.insert}>
        <Toolbar.Button>{texts.link}</Toolbar.Button>
        <Toolbar.Button>{texts.image}</Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}
