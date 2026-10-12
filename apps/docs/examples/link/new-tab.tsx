'use client'
import { Link } from '@kvirn-ui/react'
import { useLinkTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NewTab() {
  const { texts, isFallback } = useLinkTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        <Link.Root href="https://www.digg.se/" target="_blank">
          {texts.newTabLink} <Link.NewTabNotice />
        </Link.Root>
      </p>
    </InEnglishWhenFallback>
  )
}
