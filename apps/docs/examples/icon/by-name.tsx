'use client'
import { Icon, Link } from '@kvirn-ui/react'
import { useIconTexts } from './texts.ts'

export function ByName() {
  const { texts } = useIconTexts()
  return (
    <ul>
      <li>
        <Icon name="download" /> <Link href="#permit-form">{texts.downloadForm}</Link>
      </li>
      <li>
        <Icon name="calendar" /> <Link href="#book-a-time">{texts.bookTime}</Link>
      </li>
    </ul>
  )
}
