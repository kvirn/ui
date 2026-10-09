'use client'
import { Columns, Link } from '@kvirn-ui/react'
import { useColumnsTexts } from './texts.ts'

export function QuickLinks() {
  const { texts, textLang } = useColumnsTexts()
  const links = Object.values(texts.quickLinks)
  return (
    <Columns as="ul" minColumnWidth="sm" gap="4" lang={textLang}>
      {links.map((label) => (
        <li key={label}>
          <Link href="#">{label}</Link>
        </li>
      ))}
    </Columns>
  )
}
