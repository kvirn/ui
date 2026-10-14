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
import { kvirnbyFloorPlan } from '../../fixtures/content-and-media.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { ServiceLink } from '../../navigation-and-promotion/service-link/service-link.tsx'

export interface UnitPageProps {
  /** `temporarily-closed` adds a warning first in `main` and replaces the Service link with the reason. Default `open`. */
  status?: 'open' | 'temporarily-closed' | undefined
}

/**
 * A page for one unit, here a preschool, the slot between header and footer: a title, a preamble,
 * a figure, opening hours, the address, who to ask and the way to apply. Example text is English
 * and fictional (Kvirnby municipality).
 */
export function UnitPage({ status = 'open' }: UnitPageProps) {
  const closed = status === 'temporarily-closed'
  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#preschools">Preschools</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Hillside preschool</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">Hillside preschool</Heading>
            <p className="kv-lead">
              A small preschool with three groups and a large garden, a short walk from the Hillside
              bus stop.
            </p>
          </Stack>
          {closed ? (
            <Alert.Warning>
              <Alert.Title as="p">Temporarily closed</Alert.Title>
              <Alert.Body>
                <p>
                  The preschool is closed until <time dateTime="2026-11-02">2 November</time> for
                  repairs. Children are placed at Riverside preschool in the meantime.
                </p>
              </Alert.Body>
            </Alert.Warning>
          ) : null}
          <div className="kv-prose">
            <figure>
              <img
                src={kvirnbyFloorPlan}
                alt="Floor plan of Hillside preschool: four rooms, two on each side of the central hall, with the entrance at the bottom."
              />
              <figcaption>
                Hillside preschool, ground floor. Drawing: Kvirnby municipality.
              </figcaption>
            </figure>
            <Heading as="h2" size="heading-3">
              About the preschool
            </Heading>
            <p>
              Hillside has places for 54 children aged one to five. The groups spend most days
              outdoors, and the kitchen cooks lunch on site.
            </p>
          </div>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              Opening hours
            </Heading>
            <DefinitionList.Root>
              <DefinitionList.Row>
                <DefinitionList.Term>Monday to Friday</DefinitionList.Term>
                <DefinitionList.Description>6.30–18.30</DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Saturday and Sunday</DefinitionList.Term>
                <DefinitionList.Description>Closed</DefinitionList.Description>
              </DefinitionList.Row>
            </DefinitionList.Root>
          </Stack>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              Visit us
            </Heading>
            <Address>
              Hillside preschool
              <br />
              Old Mill Road 12
              <br />
              123 45 Kvirnby
            </Address>
            <p>
              <Link.Root href="https://maps.example/hillside-preschool">
                Directions to Hillside preschool in Example Maps
              </Link.Root>
            </p>
            <DefinitionList.Root>
              <DefinitionList.Row>
                <DefinitionList.Term>Entrance</DefinitionList.Term>
                <DefinitionList.Description>
                  Level, with an automatic door.
                </DefinitionList.Description>
              </DefinitionList.Row>
              <DefinitionList.Row>
                <DefinitionList.Term>Bus stop</DefinitionList.Term>
                <DefinitionList.Description>
                  Hillside, line 7, 50 metres away.
                </DefinitionList.Description>
              </DefinitionList.Row>
            </DefinitionList.Root>
          </Stack>
          <Card.Root>
            <Card.Body className="kv-prose">
              <Heading as="h2" size="heading-3">
                Contact us
              </Heading>
              <p>Hillside preschool, head of preschool</p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000002">0000-00 00 02</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:hillside@kvirnby.example">
                      hillside@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
            </Card.Body>
          </Card.Root>
          <ServiceLink.Root>
            {closed ? (
              <>
                <ServiceLink.Closed>
                  Applications for Hillside preschool are paused while it is closed.
                </ServiceLink.Closed>
                <ServiceLink.Alternative>
                  <p>
                    You can still <a href="#apply">apply for another preschool</a>.
                  </p>
                </ServiceLink.Alternative>
              </>
            ) : (
              <ServiceLink.Link href="#apply">Apply for a place</ServiceLink.Link>
            )}
          </ServiceLink.Root>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              Related units
            </Heading>
            <List.Root className="kv-list--gap-2">
              <List.Item>
                <Link.Root href="#riverside">Riverside preschool</Link.Root>
              </List.Item>
              <List.Item>
                <Link.Root href="#meadow">Meadow preschool</Link.Root>
              </List.Item>
              <List.Item>
                <Link.Root href="#hillside-school">Hillside primary school</Link.Root>
              </List.Item>
            </List.Root>
          </Stack>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
