'use client'
import { arrowForward } from '@kvirn-ui/icons'
import { Icon } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function MirrorInRtl() {
  const { texts } = useIconTexts()
  return (
    <div>
      <p>
        {texts.nextLeftToRight} <Icon icon={arrowForward} />
      </p>
      <p dir="rtl">
        {texts.nextRightToLeft} <Icon icon={arrowForward} />
      </p>
    </div>
  )
}
