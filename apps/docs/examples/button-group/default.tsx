'use client'
import { Button, ButtonGroup } from '@kvirn-ui/react'
import { useButtonGroupTexts } from './texts.ts'

export function DefaultButtonGroup() {
  const { texts, textLang } = useButtonGroupTexts()
  return (
    <ButtonGroup aria-label={texts.groupName} lang={textLang}>
      <Button className="kv-button--primary">{texts.send}</Button>
      <Button>{texts.saveDraft}</Button>
    </ButtonGroup>
  )
}
