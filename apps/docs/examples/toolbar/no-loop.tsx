'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'

export function NoLoop() {
  const { texts, textLang } = useToolbarTexts()
  return (
    <Toolbar.Root aria-label={texts.alignment} loop={false} lang={textLang}>
      <Toolbar.Button>{texts.alignStart}</Toolbar.Button>
      <Toolbar.Button>{texts.alignCenter}</Toolbar.Button>
      <Toolbar.Button>{texts.alignEnd}</Toolbar.Button>
      <Toolbar.Button>{texts.justify}</Toolbar.Button>
    </Toolbar.Root>
  )
}
