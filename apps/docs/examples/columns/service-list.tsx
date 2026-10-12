'use client'
import { Card, Columns, Heading, Link } from '@kvirn-ui/react'
import { useColumnsTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ServiceList() {
  const { texts, isFallback } = useColumnsTexts()
  const services = [texts.services.waste, texts.services.school, texts.services.housing]
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Columns as="ul">
        {services.map((service) => (
          <Card.Root key={service.title} as="li">
            <Card.Body className="kv-prose">
              <Heading as="h3">
                <Link href="#">{service.title}</Link>
              </Heading>
              <p>{service.text}</p>
            </Card.Body>
          </Card.Root>
        ))}
      </Columns>
    </InEnglishWhenFallback>
  )
}
