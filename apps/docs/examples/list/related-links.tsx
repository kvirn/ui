'use client'
import { Link, List } from '@kvirn-ui/react'
import { useListTexts } from './texts.ts'

export function RelatedLinks() {
  const { texts } = useListTexts()
  return (
    <nav aria-label={texts.relatedLabel}>
      <List.Root>
        <List.Item>
          <Link href="#building-permits">{texts.buildingPermits}</Link>
        </List.Item>
        <List.Item>
          <Link href="#waste">{texts.waste}</Link>
        </List.Item>
        <List.Item>
          <Link href="#school-transport">{texts.schoolTransport}</Link>
        </List.Item>
      </List.Root>
    </nav>
  )
}
