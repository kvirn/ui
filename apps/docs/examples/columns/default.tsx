'use client'
import { Card, Columns, Heading } from '@kvirn-ui/react'
import { useColumnsTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultColumns() {
  const { texts, isFallback } = useColumnsTexts()
  const services = [texts.services.waste, texts.services.school, texts.services.housing]
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Columns>
        {services.map((service) => (
          <Card.Root key={service.title} className="kv-prose">
            <Heading as="h3">{service.title}</Heading>
            <p>{service.text}</p>
          </Card.Root>
        ))}
      </Columns>
    </InEnglishWhenFallback>
  )
}
