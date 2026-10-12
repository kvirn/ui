'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function MirrorInRtl() {
  const { texts, isFallback } = useIconTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        <p>
          {texts.next} <Icon name="arrow-forward" />
        </p>
        <p dir="rtl">
          {texts.next} <Icon name="arrow-forward" />
        </p>
      </div>
    </InEnglishWhenFallback>
  )
}
