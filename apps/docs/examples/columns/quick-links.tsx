'use client'
import { Columns, Link } from '@kvirn-ui/react'
import { useColumnsTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function QuickLinks() {
  const { texts, isFallback } = useColumnsTexts()
  const links = Object.values(texts.quickLinks)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Columns className="kv-columns--min-sm kv-columns--gap-4" as="ul">
        {links.map((label) => (
          <li key={label}>
            <Link href="#">{label}</Link>
          </li>
        ))}
      </Columns>
    </InEnglishWhenFallback>
  )
}
