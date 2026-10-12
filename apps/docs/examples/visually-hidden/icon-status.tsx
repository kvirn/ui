'use client'
import { Icon, VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function IconStatus() {
  const { texts, isFallback } = useVisuallyHiddenTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        <Icon name="check" /> <VisuallyHidden>{texts.approvedHidden}</VisuallyHidden>
        {texts.application}
      </p>
    </InEnglishWhenFallback>
  )
}
