'use client'

import {
  Badge,
  Breadcrumb,
  Card,
  Container,
  DefinitionList,
  Heading,
  Link,
  List,
  Stack,
  useFormat,
} from '@kvirn-ui/react'
import { kvirnbyCaseBadgeVariants, kvirnbyCases } from '../../fixtures/my-pages.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { ServiceLink } from '../../navigation-and-promotion/service-link/service-link.tsx'

export interface CaseDetailProps {
  /** `action-needed` adds what the resident must do and a Service link to answer. Default `in-progress`. */
  state?: 'in-progress' | 'action-needed' | undefined
}

/**
 * One case, the slot between header and footer: breadcrumb (My pages, then the case), `h1`, the
 * status and case number, what happens next, the documents and the case officer. Example text is
 * English and fictional (Kvirnby municipality).
 */
export function CaseDetail({ state = 'in-progress' }: CaseDetailProps) {
  const format = useFormat()
  const actionNeeded = state === 'action-needed'
  const item = kvirnbyCases.find((candidate) => candidate.status === state) ?? kvirnbyCases[0]!
  const sent = format.date(new Date(item.sent), { dateStyle: 'long', timeZone: 'UTC' })
  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#my-pages">My pages</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>{item.title}</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">{item.title}</Heading>
            <p>
              <Badge variant={kvirnbyCaseBadgeVariants[item.status]}>{item.statusLabel}</Badge>
            </p>
            <DefinitionList.Root>
              <DefinitionList.Row>
                <DefinitionList.Term>Case number</DefinitionList.Term>
                <DefinitionList.Description>{item.number}</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Sent</DefinitionList.Term>
                <DefinitionList.Description>
                  <time dateTime={item.sent}>{sent}</time>
                </DefinitionList.Description>
              </DefinitionList.Row>
            </DefinitionList.Root>
          </Stack>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              What happens next
            </Heading>
            <p>
              {actionNeeded ? <strong>Action needed: </strong> : null}
              {item.nextStep}
            </p>
            {actionNeeded ? (
              <ServiceLink.Root>
                <ServiceLink.Link href="#answer">Answer the offer</ServiceLink.Link>
                <ServiceLink.Alternative>
                  <p>
                    You can also <Link.Root href="#contact">contact the case officer</Link.Root>.
                  </p>
                </ServiceLink.Alternative>
              </ServiceLink.Root>
            ) : null}
          </Stack>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              Documents
            </Heading>
            <List.Root className="kv-list--gap-2">
              <List.Item>
                <Link.Root href="#application">Your application (PDF, 120 kB)</Link.Root>
              </List.Item>
              <List.Item>
                <Link.Root href="#receipt">Confirmation of receipt (PDF, 48 kB)</Link.Root>
              </List.Item>
            </List.Root>
          </Stack>
          <Card.Root>
            <Card.Body className="kv-prose">
              <Heading as="h2" size="heading-3" id="contact">
                Case officer
              </Heading>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Name</DefinitionList.Term>
                  <DefinitionList.Description>A. Example</DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000002">0000-00 00 02</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:cases@kvirnby.example">cases@kvirnby.example</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
            </Card.Body>
          </Card.Root>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
