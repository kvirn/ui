'use client'
import { Icon, Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ServiceLink() {
  const { texts, isFallback } = useLinkTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Link.Root href="#building-permit" className="kv-link--service">
        <Link.Icon>
          <Icon name="arrow-forward" size="24" />
        </Link.Icon>
        {texts.service}
      </Link.Root>
    </InEnglishWhenFallback>
  )
}
