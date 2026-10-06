'use client'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function MirrorInRtl() {
  const { texts, textLang } = useIconTexts()
  return (
    <div lang={textLang}>
      <p>
        {texts.next} <Icon name="arrow-forward" />
      </p>
      <p dir="rtl">
        {texts.next} <Icon name="arrow-forward" />
      </p>
    </div>
  )
}
