'use client'
import { Card, Columns, Heading, Link } from '@kvirn-ui/react'
import { useColumnsTexts } from './texts.ts'

export function NewsColumns() {
  const { texts, textLang } = useColumnsTexts()
  const items = [texts.news.recycling, texts.news.snow]
  return (
    <Columns render={<ul role="list" />} minColumnWidth="lg" gap="8" lang={textLang}>
      {items.map((item) => (
        <Card.Root key={item.title} render={<li />}>
          <Card.Body className="kv-prose">
            <Heading level={3}>
              <Link href="#">{item.title}</Link>
            </Heading>
            <p>{item.excerpt}</p>
          </Card.Body>
        </Card.Root>
      ))}
    </Columns>
  )
}
