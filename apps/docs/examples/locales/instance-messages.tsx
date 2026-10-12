'use client'
import { Link } from '@kvirn-ui/react'
import { useLocalesTexts } from './texts.ts'

export function InstanceMessages() {
  const { texts } = useLocalesTexts()
  return (
    <p>
      <Link.Root
        href="https://www.digg.se/"
        target="_blank"
        messages={{ newTabNotice: texts.newTabNotice }}
      >
        {texts.newTab} <Link.NewTabNotice />
      </Link.Root>
    </p>
  )
}
