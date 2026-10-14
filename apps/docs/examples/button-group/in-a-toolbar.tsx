'use client'
import { ButtonGroup, Toolbar } from '@kvirn-ui/react'
import { useButtonGroupTexts } from './texts.ts'

export function InAToolbar() {
  const { texts } = useButtonGroupTexts()
  return (
    <Toolbar.Root aria-label={texts.toolbarName}>
      <ButtonGroup aria-label={texts.handlingName}>
        <Toolbar.Button>{texts.assignToMe}</Toolbar.Button>
        <Toolbar.Button>{texts.handOver}</Toolbar.Button>
      </ButtonGroup>
      <ButtonGroup aria-label={texts.documentsName}>
        <Toolbar.Button>{texts.addNote}</Toolbar.Button>
        <Toolbar.Button>{texts.print}</Toolbar.Button>
      </ButtonGroup>
    </Toolbar.Root>
  )
}
