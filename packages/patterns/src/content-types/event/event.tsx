'use client'

import {
  Address,
  Alert,
  Breadcrumb,
  Container,
  DefinitionList,
  Heading,
  Link,
  Prose,
  Stack,
} from '@kvirn-ui/react'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { ServiceLink } from '../../navigation-and-promotion/service-link/service-link.tsx'
import { EventTimeSpan } from './event-time.tsx'

export interface EventPageProps {
  /**
   * `cancelled` starts the title with "Cancelled:", adds a warning and has no booking link; `ended`
   * adds an inset and has no booking link; `fully-booked` says so in text instead of the link.
   * Default `upcoming`.
   */
  state?: 'upcoming' | 'cancelled' | 'ended' | 'fully-booked' | undefined
}

const startsAt = { upcoming: '2026-10-21T16:00:00Z', ended: '2026-09-23T16:00:00Z' } as const
const endsAt = { upcoming: '2026-10-21T18:00:00Z', ended: '2026-09-23T18:00:00Z' } as const

/**
 * One event, the slot between header and footer: breadcrumb, `h1`, the facts as a definition list,
 * the booking link or the reason there is none, and the description. Example text is English and
 * fictional (Kvirnby municipality).
 */
export function EventPage({ state = 'upcoming' }: EventPageProps) {
  const when = state === 'ended' ? 'ended' : 'upcoming'
  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#events">Events</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Open house at Hillside preschool</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">
            {state === 'cancelled' ? 'Cancelled: ' : ''}Open house at Hillside preschool
          </Heading>
          {state === 'cancelled' ? (
            <Alert.Warning>
              <Alert.Title as="p">This event is cancelled</Alert.Title>
              <Alert.Body>
                <p>
                  The open house will not take place. Book a visit with the head of preschool
                  instead.
                </p>
              </Alert.Body>
            </Alert.Warning>
          ) : null}
          {state === 'ended' ? (
            <div className="kv-inset">
              <p>This event has ended. See the other events for what is coming up.</p>
            </div>
          ) : null}
          <DefinitionList.Root>
            <DefinitionList.Row>
              <DefinitionList.Term>When</DefinitionList.Term>
              <DefinitionList.Description>
                <EventTimeSpan startsAt={startsAt[when]} endsAt={endsAt[when]} />
              </DefinitionList.Description>
            </DefinitionList.Row>
            <DefinitionList.Row>
              <DefinitionList.Term>Where</DefinitionList.Term>
              <DefinitionList.Description>
                <Address>
                  Hillside preschool
                  <br />
                  Old Mill Road 12
                  <br />
                  123 45 Kvirnby
                </Address>
              </DefinitionList.Description>
            </DefinitionList.Row>
            <DefinitionList.Row>
              <DefinitionList.Term>Cost</DefinitionList.Term>
              <DefinitionList.Description>Free</DefinitionList.Description>
            </DefinitionList.Row>
            <DefinitionList.Row>
              <DefinitionList.Term>Accessibility</DefinitionList.Term>
              <DefinitionList.Description>
                Level entrance with an automatic door. Hearing loop in the hall.
              </DefinitionList.Description>
            </DefinitionList.Row>
            <DefinitionList.Row>
              <DefinitionList.Term>Organiser</DefinitionList.Term>
              <DefinitionList.Description>Hillside preschool</DefinitionList.Description>
            </DefinitionList.Row>
          </DefinitionList.Root>
          {state === 'upcoming' ? (
            <ServiceLink.Root>
              <ServiceLink.Link href="#book">Book a place</ServiceLink.Link>
            </ServiceLink.Root>
          ) : null}
          {state === 'fully-booked' ? (
            <p>
              Fully booked. <Link.Root href="#events">See other events</Link.Root>.
            </p>
          ) : null}
          <Prose>
            <p>
              Come and see the groups, the garden and the kitchen, and meet the staff. You can ask
              about places for the spring term.
            </p>
          </Prose>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
