'use client'
import { Button, ButtonGroup } from '@kvirn-ui/react'
import { useButtonGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultButtonGroup() {
  const { texts, isFallback } = useButtonGroupTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <ButtonGroup aria-label={texts.groupName}>
        <Button className="kv-button--primary">{texts.send}</Button>
        <Button>{texts.saveDraft}</Button>
      </ButtonGroup>
    </InEnglishWhenFallback>
  )
}
