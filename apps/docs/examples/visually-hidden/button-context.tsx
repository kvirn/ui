'use client'
import { Button, VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function ButtonContext() {
  const { texts, textLang } = useVisuallyHiddenTexts()
  return (
    <ul lang={textLang}>
      <li>
        <Button>
          {texts.remove}
          <VisuallyHidden>{texts.removeSavedSearch}</VisuallyHidden>
        </Button>
      </li>
      <li>
        <Button>
          {texts.remove}
          <VisuallyHidden>{texts.removeAddress}</VisuallyHidden>
        </Button>
      </li>
    </ul>
  )
}
