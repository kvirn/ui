'use client'
import { VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultVisuallyHidden() {
  const { texts, isFallback } = useVisuallyHiddenTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <p>
          {texts.unread}
          <VisuallyHidden>{texts.unreadHidden}</VisuallyHidden>
        </p>
        <p>
          <small>{texts.hint}</small>
        </p>
      </div>
    </InEnglishWhenFallback>
  )
}
