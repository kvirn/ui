'use client'
import { Button, ButtonGroup } from '@kvirn-ui/react'
import { useExampleTexts } from '../../components/example-texts.tsx'

export function Variants() {
  const { texts, textLang } = useExampleTexts()
  return (
    <>
      <ButtonGroup>
        <Button className="kv-button--primary" lang={textLang}>
          {texts.button.sendApplication}
        </Button>
        <Button lang={textLang}>{texts.button.saveDraft}</Button>
        <Button className="kv-button--danger" lang={textLang}>
          {texts.button.deleteDraft}
        </Button>
      </ButtonGroup>
      <p lang={textLang}>{texts.button.dangerNote}</p>
    </>
  )
}
