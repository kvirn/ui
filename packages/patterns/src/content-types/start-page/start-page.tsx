'use client'

import {
  Card,
  Grid,
  Container,
  Heading,
  Link,
  Section,
  Stack,
  DefinitionList,
} from '@kvirn-ui/react'
import { kvirnbyHills, kvirnbySquare } from '../../fixtures/images.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { Hero } from '../../navigation-and-promotion/hero/hero.tsx'
import { NavTiles } from '../../navigation-and-promotion/nav-tiles/nav-tiles.tsx'

export interface StartPageProps {
  /** How many top tasks the "Popular services" list shows. Default 6. */
  topTasks?: 6 | 8 | undefined
}

/**
 * The front door of the site, the slot between header and footer: hero, top tasks, topics, news,
 * events, one feature and contact. Example text is English and fictional (Kvirnby municipality).
 */
export function StartPage({ topTasks = 6 }: StartPageProps) {
  return (
    <>
      <PageFrame.Main bleed>
        <Hero.Root>
          <Hero.Heading>Kvirnby municipality</Hero.Heading>
          <Hero.Lead>
            Find services, news and events in Kvirnby, from preschool to building permits.
          </Hero.Lead>
          <Hero.Image src={kvirnbyHills} />
        </Hero.Root>
        <Section className="kv-section--padding-lg">
          <Container>
            <Stack className="kv-stack--gap-8">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-2">
                  Popular services
                </Heading>
                <Grid.Root className="kv-grid--fit-sm kv-grid--gap-4" as="ul">
                  <li>
                    <Link.Root href="#preschool">Apply for a preschool place</Link.Root>
                  </li>
                  <li>
                    <Link.Root href="#waste">Book a bulky waste pickup</Link.Root>
                  </li>
                  <li>
                    <Link.Root href="#permit">Apply for a building permit</Link.Root>
                  </li>
                  <li>
                    <Link.Root href="#report">Report a fault</Link.Root>
                  </li>
                  <li>
                    <Link.Root href="#support">Apply for income support</Link.Root>
                  </li>
                  <li>
                    <Link.Root href="#transport">Apply for school transport</Link.Root>
                  </li>
                  {topTasks === 8 ? (
                    <>
                      <li>
                        <Link.Root href="#parking">Apply for a parking permit</Link.Root>
                      </li>
                      <li>
                        <Link.Root href="#home-care">Apply for home care</Link.Root>
                      </li>
                    </>
                  ) : null}
                </Grid.Root>
              </Stack>
              <Stack>
                <Heading as="h2" size="heading-2">
                  Municipal services
                </Heading>
                <NavTiles.Root>
                  <NavTiles.Tile>
                    <NavTiles.Heading level="h3" href="#children">
                      Children and education
                    </NavTiles.Heading>
                    <NavTiles.Text>
                      Preschool, school and after-school care for children and young people.
                    </NavTiles.Text>
                  </NavTiles.Tile>
                  <NavTiles.Tile>
                    <NavTiles.Heading level="h3" href="#building">
                      Building and environment
                    </NavTiles.Heading>
                    <NavTiles.Text>Building permits, waste, water and sewage.</NavTiles.Text>
                  </NavTiles.Tile>
                  <NavTiles.Tile>
                    <NavTiles.Heading level="h3" href="#care">
                      Support and care
                    </NavTiles.Heading>
                    <NavTiles.Text>
                      Home care, elderly care and support for people with disabilities.
                    </NavTiles.Text>
                  </NavTiles.Tile>
                  <NavTiles.Tile>
                    <NavTiles.Heading level="h3" href="#living">
                      Living and environment
                    </NavTiles.Heading>
                    <NavTiles.Text>Housing, planning, roads and public spaces.</NavTiles.Text>
                  </NavTiles.Tile>
                  <NavTiles.Tile>
                    <NavTiles.Heading level="h3" href="#culture">
                      Culture and leisure
                    </NavTiles.Heading>
                    <NavTiles.Text>
                      Libraries, sports halls, swimming pools and events.
                    </NavTiles.Text>
                  </NavTiles.Tile>
                  <NavTiles.Tile>
                    <NavTiles.Heading level="h3" href="#business">
                      Business and work
                    </NavTiles.Heading>
                    <NavTiles.Text>
                      Starting a business, permits for businesses and job support.
                    </NavTiles.Text>
                  </NavTiles.Tile>
                  <NavTiles.Tile>
                    <NavTiles.Heading level="h3" href="#traffic">
                      Traffic and travel
                    </NavTiles.Heading>
                    <NavTiles.Text>
                      Public transport, parking, cycling and road works.
                    </NavTiles.Text>
                  </NavTiles.Tile>
                </NavTiles.Root>
              </Stack>
              <Stack>
                <Heading as="h2" size="heading-2">
                  News
                </Heading>
                <Grid.Root className="kv-grid--fit-sm" as="ul">
                  <Card.Root as="li">
                    <Card.Body className="kv-prose">
                      <Heading as="h3" size="heading-3">
                        <Link.Root href="#pool">The swimming hall reopens</Link.Root>
                      </Heading>
                      <p>
                        <time dateTime="2026-10-06">6 October 2026</time>
                      </p>
                      <p>After the renovation, swimmers are welcome from Monday.</p>
                    </Card.Body>
                  </Card.Root>
                  <Card.Root as="li">
                    <Card.Body className="kv-prose">
                      <Heading as="h3" size="heading-3">
                        <Link.Root href="#library">New library opening hours</Link.Root>
                      </Heading>
                      <p>
                        <time dateTime="2026-10-03">3 October 2026</time>
                      </p>
                      <p>The main library is open until 8 pm from the autumn.</p>
                    </Card.Body>
                  </Card.Root>
                  <Card.Root as="li">
                    <Card.Body className="kv-prose">
                      <Heading as="h3" size="heading-3">
                        <Link.Root href="#water">Work on the water mains</Link.Root>
                      </Heading>
                      <p>
                        <time dateTime="2026-10-01">1 October 2026</time>
                      </p>
                      <p>The water is shut off on Main Street on 14 October.</p>
                    </Card.Body>
                  </Card.Root>
                </Grid.Root>
                <p>
                  <Link.Root href="#news">All news</Link.Root>
                </p>
              </Stack>
              <Stack>
                <Heading as="h2" size="heading-2">
                  Events
                </Heading>
                <Grid.Root className="kv-grid--fit-sm" as="ul">
                  <Card.Root as="li">
                    <Card.Body className="kv-prose">
                      <Heading as="h3" size="heading-3">
                        <Link.Root href="#dialogue">Citizen dialogue on the new square</Link.Root>
                      </Heading>
                      <p>
                        <time dateTime="2026-11-12">12 November 2026</time>, 6–8 pm, Kvirnby school
                      </p>
                      <p>Tell us what you want on the square before the plan goes out.</p>
                    </Card.Body>
                  </Card.Root>
                  <Card.Root as="li">
                    <Card.Body className="kv-prose">
                      <Heading as="h3" size="heading-3">
                        <Link.Root href="#market">Autumn market</Link.Root>
                      </Heading>
                      <p>
                        <time dateTime="2026-10-24">24 October 2026</time>, 10 am–3 pm, Market
                        Square
                      </p>
                      <p>Local food, crafts and music in the square.</p>
                    </Card.Body>
                  </Card.Root>
                  <Card.Root as="li">
                    <Card.Body className="kv-prose">
                      <Heading as="h3" size="heading-3">
                        <Link.Root href="#concert">Concert in the church</Link.Root>
                      </Heading>
                      <p>
                        <time dateTime="2026-10-30">30 October 2026</time>, 7 pm, Kvirnby church
                      </p>
                      <p>The municipal choir sings songs of the autumn.</p>
                    </Card.Body>
                  </Card.Root>
                </Grid.Root>
                <p>
                  <Link.Root href="#events">All events</Link.Root>
                </p>
              </Stack>
              <Stack>
                <Heading as="h2" size="heading-2">
                  In focus
                </Heading>
                <Card.Root as="article">
                  <Card.Body className="kv-prose">
                    <Heading as="h3" size="heading-3">
                      <Link.Root href="#square">A new square in the centre of Kvirnby</Link.Root>
                    </Heading>
                    <p>
                      Read about the plans for the square and how you can take part in the dialogue.
                    </p>
                  </Card.Body>
                  <Card.Footer className="kv-card-footer--padding-none">
                    <img src={kvirnbySquare} alt="" />
                  </Card.Footer>
                </Card.Root>
              </Stack>
              <Card.Root>
                <Card.Body className="kv-prose">
                  <Heading as="h2" size="heading-3">
                    Contact us
                  </Heading>
                  <p>Contact centre</p>
                  <DefinitionList.Root>
                    <DefinitionList.Row>
                      <DefinitionList.Term>Phone</DefinitionList.Term>
                      <DefinitionList.Description>
                        <Link.Root href="tel:+46000000001">0000-00 00 01</Link.Root>
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
                    <DefinitionList.Row>
                      <DefinitionList.Term>Phone hours</DefinitionList.Term>
                      <DefinitionList.Description>
                        Monday to Thursday 9.00–11.00
                      </DefinitionList.Description>
                    </DefinitionList.Row>
                  </DefinitionList.Root>
                </Card.Body>
              </Card.Root>
            </Stack>
          </Container>
        </Section>
      </PageFrame.Main>
    </>
  )
}
