'use client'

import { Badge, Card, DefinitionList, Heading, Link, useFormat } from '@kvirn-ui/react'
import { kvirnbyCaseBadgeVariants } from '../../fixtures/my-pages.ts'
import type { KvirnbyCase } from '../../fixtures/my-pages.ts'

/**
 * One case as a list item: the title is the one link, the status is a Badge and words, the next
 * step is a sentence that starts with "Action needed:" when the resident must act. Render it
 * inside `Grid.Root as="ul"`.
 */
export function CaseCard({
  item,
  headingLevel = 'h3',
}: {
  item: KvirnbyCase
  headingLevel?: 'h2' | 'h3'
}) {
  const format = useFormat()
  const date = (isoDate: string) => (
    <time dateTime={isoDate}>
      {format.date(new Date(isoDate), { dateStyle: 'long', timeZone: 'UTC' })}
    </time>
  )
  return (
    <Card.Root as="li">
      <Card.Body className="kv-prose">
        <Heading as={headingLevel} size="heading-4">
          <Link.Root href={item.href}>{item.title}</Link.Root>
        </Heading>
        <p>
          <Badge variant={kvirnbyCaseBadgeVariants[item.status]}>{item.statusLabel}</Badge>
        </p>
        <p>
          {item.status === 'action-needed' ? <strong>Action needed: </strong> : null}
          {item.nextStep}
        </p>
        <DefinitionList.Root>
          <DefinitionList.Row>
            <DefinitionList.Term>Case number</DefinitionList.Term>
            <DefinitionList.Description>{item.number}</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>Sent</DefinitionList.Term>
            <DefinitionList.Description>{date(item.sent)}</DefinitionList.Description>
          </DefinitionList.Row>
          <DefinitionList.Row>
            <DefinitionList.Term>Last change</DefinitionList.Term>
            <DefinitionList.Description>{date(item.lastChange)}</DefinitionList.Description>
          </DefinitionList.Row>
        </DefinitionList.Root>
      </Card.Body>
    </Card.Root>
  )
}
