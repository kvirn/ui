'use client'
import { Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'

export function NewTab() {
  const { texts } = useLinkTexts()
  return (
    <p>
      <Link.Root href="https://www.digg.se/" target="_blank">
        {texts.newTabLink} <Link.NewTabNotice />
      </Link.Root>
    </p>
  )
}
