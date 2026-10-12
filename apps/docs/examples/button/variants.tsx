'use client'
import { Button, ButtonGroup } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Variants() {
  const { texts, isFallback } = useExampleTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <ButtonGroup>
          <Button className="kv-button--primary">{texts.button.sendApplication}</Button>
          <Button>{texts.button.saveDraft}</Button>
          <Button className="kv-button--danger">{texts.button.deleteDraft}</Button>
        </ButtonGroup>
        <p>{texts.button.dangerNote}</p>
      </>
    </InEnglishWhenFallback>
  )
}
