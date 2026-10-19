'use client'
import { Button, ButtonGroup } from '@kvirn-ui/react'
import { useButtonTexts } from './texts.ts'

export function Variants() {
  const { texts } = useButtonTexts()
  return (
    <>
      <ButtonGroup>
        <Button className="kv-button--primary">{texts.sendApplication}</Button>
        <Button>{texts.saveDraft}</Button>
        <Button className="kv-button--danger">{texts.deleteDraft}</Button>
      </ButtonGroup>
      <p>{texts.dangerNote}</p>
    </>
  )
}
