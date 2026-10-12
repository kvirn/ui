'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NoLoop() {
  const { texts, isFallback } = useToolbarTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Toolbar.Root aria-label={texts.alignment} loop={false}>
        <Toolbar.Button>{texts.alignStart}</Toolbar.Button>
        <Toolbar.Button>{texts.alignCenter}</Toolbar.Button>
        <Toolbar.Button>{texts.alignEnd}</Toolbar.Button>
        <Toolbar.Button>{texts.justify}</Toolbar.Button>
      </Toolbar.Root>
    </InEnglishWhenFallback>
  )
}
