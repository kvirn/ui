'use client'
import { Link, Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'

export function OtherControls() {
  const { texts, textLang } = useToolbarTexts()
  return (
    <Toolbar.Root aria-label={texts.formatting} lang={textLang}>
      <Toolbar.Button>{texts.undo}</Toolbar.Button>
      <Toolbar.Toggle>{texts.bold}</Toolbar.Toggle>
      <Toolbar.Item as={Link.Root} href="#accessibility">
        {texts.guide}
      </Toolbar.Item>
    </Toolbar.Root>
  )
}
