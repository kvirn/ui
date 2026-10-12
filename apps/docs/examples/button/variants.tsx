'use client'
import { Button, ButtonGroup } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'

export function Variants() {
  const { texts } = useExampleTexts()
  return (
    <>
      <ButtonGroup>
        <Button className="kv-button--primary">{texts.button.sendApplication}</Button>
        <Button>{texts.button.saveDraft}</Button>
        <Button className="kv-button--danger">{texts.button.deleteDraft}</Button>
      </ButtonGroup>
      <p>{texts.button.dangerNote}</p>
    </>
  )
}
