'use client'
import { Button, VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function ButtonContext() {
  const { texts } = useVisuallyHiddenTexts()
  return (
    <ul>
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
