'use client'
import { Card, Columns, Heading } from '@kvirn-ui/react'
import { useColumnsTexts } from './texts.ts'

export function DefaultColumns() {
  const { texts, textLang } = useColumnsTexts()
  const services = [texts.services.waste, texts.services.school, texts.services.housing]
  return (
    <Columns lang={textLang}>
      {services.map((service) => (
        <Card.Root key={service.title} className="kv-prose">
          <Heading as="h3">{service.title}</Heading>
          <p>{service.text}</p>
        </Card.Root>
      ))}
    </Columns>
  )
}
