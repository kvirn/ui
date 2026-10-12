'use client'
import { Button, VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ButtonContext() {
  const { texts, isFallback } = useVisuallyHiddenTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
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
    </InEnglishWhenFallback>
  )
}
