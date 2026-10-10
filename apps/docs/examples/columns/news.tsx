'use client'
import { Card, Columns, Heading, Link } from '@kvirn-ui/react'
import { useColumnsTexts } from './texts.ts'

export function NewsColumns() {
  const { texts, textLang } = useColumnsTexts()
  const items = [texts.news.recycling, texts.news.snow]
  return (
    <Columns className="kv-columns--min-lg kv-columns--gap-8" as="ul" lang={textLang}>
      {items.map((item) => (
        <Card.Root key={item.title} as="li">
          <Card.Body className="kv-prose">
            <Heading as="h3">
              <Link href="#">{item.title}</Link>
            </Heading>
            <p>{item.excerpt}</p>
          </Card.Body>
        </Card.Root>
      ))}
    </Columns>
  )
}
