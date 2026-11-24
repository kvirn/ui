'use client'
import { Badge, Link } from '@kvirn/ui'
import { useBadgeTexts } from './texts.ts'

export function CountInALink() {
  const { texts } = useBadgeTexts()
  return (
    <p>
      <Link href="#messages">
        {texts.inbox.link} <Badge variant="primary">{texts.inbox.unread}</Badge>
      </Link>
    </p>
  )
}
