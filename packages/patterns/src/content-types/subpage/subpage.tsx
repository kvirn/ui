'use client'

import {
  Breadcrumb,
  Card,
  Container,
  Heading,
  Link,
  List,
  Stack,
  DefinitionList,
} from '@kvirn-ui/react'
import { kvirnbySquare } from '../../fixtures/images.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { NavTiles } from '../../navigation-and-promotion/nav-tiles/nav-tiles.tsx'
import { PageTools } from '../../site-chrome/page-tools/page-tools.tsx'

export interface SubpageProps {
  /** How many child pages the tiles list. Default 5. */
  childPages?: 3 | 5 | 7 | undefined
}

/**
 * A topic page that sends the visitor on, the slot between header and footer: a title, a preamble,
 * a tile for each child page, shortcuts, one piece of news and who to ask. Example text is English
 * and fictional (Kvirnby municipality).
 */
export function Subpage({ childPages = 5 }: SubpageProps) {
  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Children and education</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main>
        <Stack className="kv-stack--gap-8">
          <Stack className="kv-stack--gap-4">
            <Heading as="h1">Children and education</Heading>
            <p className="kv-lead">
              Preschool, school and adult education in Kvirnby. Find where to apply, what it costs
              and who to ask.
            </p>
          </Stack>
          <NavTiles.Root>
            <NavTiles.Tile>
              <NavTiles.Heading href="#preschool">Preschool and childcare</NavTiles.Heading>
              <NavTiles.Text>Apply for a place, fees and what the day looks like.</NavTiles.Text>
            </NavTiles.Tile>
            <NavTiles.Tile>
              <NavTiles.Heading href="#primary">Primary school</NavTiles.Heading>
              <NavTiles.Text>Choosing a school, school meals and school transport.</NavTiles.Text>
            </NavTiles.Tile>
            <NavTiles.Tile>
              <NavTiles.Heading href="#upper-secondary">Upper secondary school</NavTiles.Heading>
              <NavTiles.Text>Programmes, applying and student support.</NavTiles.Text>
            </NavTiles.Tile>
            {childPages !== 3 ? (
              <>
                <NavTiles.Tile>
                  <NavTiles.Heading href="#after-school">After-school care</NavTiles.Heading>
                  <NavTiles.Text>Places, fees and opening hours.</NavTiles.Text>
                </NavTiles.Tile>
                <NavTiles.Tile>
                  <NavTiles.Heading href="#adult">Adult education</NavTiles.Heading>
                  <NavTiles.Text>
                    Courses, Swedish for immigrants and vocational training.
                  </NavTiles.Text>
                </NavTiles.Tile>
              </>
            ) : null}
            {childPages === 7 ? (
              <>
                <NavTiles.Tile>
                  <NavTiles.Heading href="#special">Special support</NavTiles.Heading>
                  <NavTiles.Text>Support for children and students who need more.</NavTiles.Text>
                </NavTiles.Tile>
                <NavTiles.Tile>
                  <NavTiles.Heading href="#health">Student health</NavTiles.Heading>
                  <NavTiles.Text>
                    School nurse, counsellor and other student health services.
                  </NavTiles.Text>
                </NavTiles.Tile>
              </>
            ) : null}
          </NavTiles.Root>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              Shortcuts
            </Heading>
            <List.Root className="kv-list--gap-2">
              <List.Item>
                <Link.Root href="#fees">Fees for preschool and after-school care</Link.Root>
              </List.Item>
              <List.Item>
                <Link.Root href="#term-dates">Term dates</Link.Root>
              </List.Item>
              <List.Item>
                <Link.Root href="#school-meals">School meals and menus</Link.Root>
              </List.Item>
            </List.Root>
          </Stack>
          <Stack>
            <Heading as="h2" size="heading-2">
              In focus
            </Heading>
            <Card.Root as="article">
              <Card.Body className="kv-prose">
                <Heading as="h3" size="heading-3">
                  <Link.Root href="#pool">The new preschool opens in January</Link.Root>
                </Heading>
                <p>Forty new places in North Kvirnby. See how the queue and the placement work.</p>
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
              <p>Preschool office</p>
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
                    <Link.Root href="mailto:preschool@kvirnby.example">
                      preschool@kvirnby.example
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
          <PageTools.Root>
            <p className="kv-page-tools-updated">
              Last updated: <time dateTime="2026-10-02">2 October 2026</time>
            </p>
            <PageTools.CopyLink>Copy link</PageTools.CopyLink>
            <PageTools.Print>Print</PageTools.Print>
          </PageTools.Root>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
