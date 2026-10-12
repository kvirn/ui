'use client'
import { Link, Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OtherControls() {
  const { texts, isFallback } = useToolbarTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Toolbar.Root aria-label={texts.formatting}>
        <Toolbar.Button>{texts.undo}</Toolbar.Button>
        <Toolbar.Toggle>{texts.bold}</Toolbar.Toggle>
        <Toolbar.Item as={Link.Root} href="#accessibility">
          {texts.guide}
        </Toolbar.Item>
      </Toolbar.Root>
    </InEnglishWhenFallback>
  )
}
