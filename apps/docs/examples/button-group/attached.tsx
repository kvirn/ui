'use client'
import { Button, ButtonGroup } from '@kvirn-ui/react'
import { useButtonGroupTexts } from './texts.ts'

export function Attached() {
  const { texts } = useButtonGroupTexts()
  return (
    <>
      <p>{texts.letterIntro}</p>
      <ButtonGroup className="kv-button-group--attached" aria-label={texts.historyName}>
        <Button>{texts.undo}</Button>
        <Button>{texts.redo}</Button>
      </ButtonGroup>
    </>
  )
}
