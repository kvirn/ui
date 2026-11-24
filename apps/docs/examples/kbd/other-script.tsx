'use client'
import { Kbd } from '@kvirn/ui'
import { useKbdTexts } from './texts.ts'

export function OtherScript() {
  const { texts } = useKbdTexts()
  return (
    <p lang="ar" dir="rtl">
      {texts.arabicBefore}{' '}
      <span lang="en">
        <Kbd>Tab</Kbd>
      </span>{' '}
      {texts.arabicAfter}
    </p>
  )
}
