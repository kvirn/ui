'use client'

import {
  Address,
  Alert,
  Breadcrumb,
  Card,
  Container,
  DefinitionList,
  Heading,
  Link,
  List,
  Stack,
} from '@kvirn-ui/react'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { ServiceLink } from '../../navigation-and-promotion/service-link/service-link.tsx'

export interface ContactProps {
  /** `holiday` adds an exception to the opening hours; `phone-closed` says the phone lines are closed today. Default `normal`. */
  state?: 'normal' | 'holiday' | 'phone-closed' | undefined
}

/**
 * The contact page, the slot between header and footer: the contact centre, opening hours, the
 * visiting address, a Service link and other ways to get in touch. Example text is English and
 * fictional (Kvirnby municipality).
 */
export function Contact({ state = 'normal' }: ContactProps) {
  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Contact</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">Contact Kvirnby municipality</Heading>
            <p className="kv-lead">
              Call, write or visit the contact centre. We answer most questions straight away.
            </p>
          </Stack>
          <Card.Root>
            <Card.Body className="kv-prose">
              <Heading as="h2" size="heading-3">
                Contact centre
              </Heading>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    {state === 'phone-closed' ? (
                      'The phone lines are closed today. They open again tomorrow at 8.00.'
                    ) : (
                      <Link.Root href="tel:+46000000000">0000-00 00 00</Link.Root>
                    )}
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:contact@kvirnby.example">
                      contact@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
            </Card.Body>
          </Card.Root>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              Opening hours
            </Heading>
            {state === 'phone-closed' ? (
              <Alert.Warning>
                <Alert.Title as="p">Phone lines closed today</Alert.Title>
                <Alert.Body>
                  <p>Write to us instead and we answer within two working days.</p>
                </Alert.Body>
              </Alert.Warning>
            ) : null}
            <DefinitionList.Root>
              <DefinitionList.Row>
                <DefinitionList.Term>Monday</DefinitionList.Term>
                <DefinitionList.Description>8.00–17.00</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Tuesday to Thursday</DefinitionList.Term>
                <DefinitionList.Description>8.00–16.00</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Friday</DefinitionList.Term>
                <DefinitionList.Description>8.00–15.00</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Saturday and Sunday</DefinitionList.Term>
                <DefinitionList.Description>Closed</DefinitionList.Description>
              </DefinitionList.Row>
            </DefinitionList.Root>
            {state === 'holiday' ? (
              <div className="kv-inset">
                <Heading as="h3" size="heading-4">
                  Different hours
                </Heading>
                <p>
                  On <time dateTime="2026-12-24">24 December</time> the contact centre is closed. On{' '}
                  <time dateTime="2026-12-23">23 December</time> it closes at 12.00.
                </p>
              </div>
            ) : null}
          </Stack>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              Visit us
            </Heading>
            <Address>
              Town Hall
              <br />
              Main Street 1
              <br />
              123 45 Kvirnby
            </Address>
            <p>
              <Link.Root href="https://maps.example/kvirnby-town-hall">
                Directions to Town Hall in Example Maps
              </Link.Root>
            </p>
            <DefinitionList.Root>
              <DefinitionList.Row>
                <DefinitionList.Term>Entrance</DefinitionList.Term>
                <DefinitionList.Description>
                  Level entrance from Main Street, automatic door.
                </DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Parking for disabled people</DefinitionList.Term>
                <DefinitionList.Description>
                  Two spaces next to the entrance.
                </DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Hearing loop</DefinitionList.Term>
                <DefinitionList.Description>At the reception desk.</DefinitionList.Description>
              </DefinitionList.Row>
            </DefinitionList.Root>
          </Stack>
          <ServiceLink.Root>
            <ServiceLink.Link href="#report-a-fault">Report a fault</ServiceLink.Link>
          </ServiceLink.Root>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              Other ways to get in touch
            </Heading>
            <List.Root className="kv-list--gap-2">
              <List.Item>
                <Link.Root href="#social-services">Contact social services</Link.Root>
              </List.Item>
              <List.Item>
                <Link.Root href="#press">Press and media enquiries</Link.Root>
              </List.Item>
              <List.Item>
                <Link.Root href="#post">Postal address and invoices</Link.Root>
              </List.Item>
            </List.Root>
          </Stack>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
