'use client'
import { Icon, Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'

export function ServiceLink() {
  const { texts } = useLinkTexts()
  return (
    <Link.Root href="#building-permit" className="kv-link--service">
      <Link.Icon>
        <Icon name="arrow-forward" size="24" />
      </Link.Icon>
      {texts.service}
    </Link.Root>
  )
}
