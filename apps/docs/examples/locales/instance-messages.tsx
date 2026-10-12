'use client'
import { Link } from '@kvirn-ui/react'
import { useLocalesTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function InstanceMessages() {
  const { texts, isFallback } = useLocalesTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <p>
        <Link.Root
          href="https://www.digg.se/"
          target="_blank"
          messages={{ newTabNotice: texts.newTabNotice }}
        >
          {texts.newTab} <Link.NewTabNotice />
        </Link.Root>
      </p>
    </InEnglishWhenFallback>
  )
}
