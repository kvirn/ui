'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useId } from 'react'
import { useToolbarTexts } from './texts.ts'

export function Unavailable() {
  const { texts } = useToolbarTexts()
  const reasonId = useId()
  return (
    <div>
      <Toolbar.Root aria-label={texts.history}>
        <Toolbar.Button>{texts.undo}</Toolbar.Button>
        <Toolbar.Button disabled aria-describedby={reasonId}>
          {texts.redo}
        </Toolbar.Button>
        <Toolbar.Button>{texts.link}</Toolbar.Button>
      </Toolbar.Root>
      <p id={reasonId}>{texts.redoReason}</p>
    </div>
  )
}
