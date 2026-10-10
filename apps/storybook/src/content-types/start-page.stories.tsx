import { en } from '@kvirn-ui/i18n/en'
import { Hero, NavTiles, PageFrame, SiteAlert } from '@kvirn-ui/patterns'
import { kvirnbyHills, kvirnbySquare } from '@kvirn-ui/patterns/fixtures'
import {
  Card,
  Columns,
  Container,
  Heading,
  KvirnProvider,
  Link,
  Section,
  Stack,
  SummaryList,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { KvirnbyFooter, KvirnbyHeader, expectPageOutline } from './kvirnby-chrome.tsx'
// Content types/Start page: a whole page in the site chrome (docs/design/storybook-patterns.md section 7).
// Story-only: the page is literal JSX of the patterns, which an adopter copies. No data objects.

const description = `The front door of the site: who the municipality is, the most-done tasks, the topics, what is new and how to reach someone. One \`h1\` in the hero, then \`h2\` sections in the order a visitor needs them. The hero has no search field of its own because the header search is the page's search.

Written as literal JSX from the patterns: [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs), [Site header](?path=/docs/patterns-site-chrome-site-header--docs), [Site alert](?path=/docs/patterns-site-chrome-site-alert--docs), [Hero](?path=/docs/patterns-navigation-and-promotion-hero--docs), top tasks (a \`Heading\` over \`Columns as="ul"\` of [Link](?path=/docs/components-actions-link--docs)s, six links here and eight under the site alert), [Nav tiles](?path=/docs/patterns-navigation-and-promotion-nav-tiles--docs), [Card](?path=/docs/components-content-card--docs), [Contact card](?path=/docs/patterns-places-and-contacts-contact-card--docs) and [Site footer](?path=/docs/patterns-site-chrome-site-footer--docs). Copy the story's code and replace the text. News and events are Cards in \`Columns as="ul"\` until a News list and an Event list exist.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the site alert is a named region before \`main\`; every repeated navigation has its own name; nothing is sticky and nothing is reordered with CSS. Designed and tested to meet WCAG 2.2 AA.

## Parts and gaps

\`PageFrame.Main bleed\` is a full-width \`main\` with no \`Container\`, so the Hero and each band bring their own \`Container\`.
`

const meta = {
  title: 'Content types/Start page',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The start page without a notice: hero, top tasks, topics, news, events, one feature and contact, in that order. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <KvirnbyHeader current="page" />
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
                  <Columns className="kv-columns--min-sm kv-columns--gap-4" as="ul">
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
                  </Columns>
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
                  <Columns className="kv-columns--min-sm" as="ul">
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
                  </Columns>
                  <p>
                    <Link.Root href="#news">All news</Link.Root>
                  </p>
                </Stack>
                <Stack>
                  <Heading as="h2" size="heading-2">
                    Events
                  </Heading>
                  <Columns className="kv-columns--min-sm" as="ul">
                    <Card.Root as="li">
                      <Card.Body className="kv-prose">
                        <Heading as="h3" size="heading-3">
                          <Link.Root href="#dialogue">Citizen dialogue on the new square</Link.Root>
                        </Heading>
                        <p>
                          <time dateTime="2026-11-12">12 November 2026</time>, 6–8 pm, Kvirnby
                          school
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
                  </Columns>
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
                        Read about the plans for the square and how you can take part in the
                        dialogue.
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
                    <SummaryList.Root>
                      <SummaryList.Row>
                        <SummaryList.Key>Phone</SummaryList.Key>
                        <SummaryList.Value>
                          <Link.Root href="tel:+46000000001">0000-00 00 01</Link.Root>
                        </SummaryList.Value>
                      </SummaryList.Row>
                      <SummaryList.Row>
                        <SummaryList.Key>Email</SummaryList.Key>
                        <SummaryList.Value>
                          <Link.Root href="mailto:contact@kvirnby.example">
                            contact@kvirnby.example
                          </Link.Root>
                        </SummaryList.Value>
                      </SummaryList.Row>
                      <SummaryList.Row>
                        <SummaryList.Key>Phone hours</SummaryList.Key>
                        <SummaryList.Value>Monday to Thursday 9.00–11.00</SummaryList.Value>
                      </SummaryList.Row>
                    </SummaryList.Root>
                  </Card.Body>
                </Card.Root>
              </Stack>
            </Container>
          </Section>
        </PageFrame.Main>
        <KvirnbyFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** A site alert, a named region between the header and `main`. Close it and focus moves to `main`. The top tasks are eight links. */
export const WithSiteAlert: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <KvirnbyHeader current="page" />
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
        </SiteAlert.Root>
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
                  <Columns className="kv-columns--min-sm kv-columns--gap-4" as="ul">
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
                    <li>
                      <Link.Root href="#parking">Apply for a parking permit</Link.Root>
                    </li>
                    <li>
                      <Link.Root href="#home-care">Apply for home care</Link.Root>
                    </li>
                  </Columns>
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
                  <Columns className="kv-columns--min-sm" as="ul">
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
                  </Columns>
                  <p>
                    <Link.Root href="#news">All news</Link.Root>
                  </p>
                </Stack>
                <Stack>
                  <Heading as="h2" size="heading-2">
                    Events
                  </Heading>
                  <Columns className="kv-columns--min-sm" as="ul">
                    <Card.Root as="li">
                      <Card.Body className="kv-prose">
                        <Heading as="h3" size="heading-3">
                          <Link.Root href="#dialogue">Citizen dialogue on the new square</Link.Root>
                        </Heading>
                        <p>
                          <time dateTime="2026-11-12">12 November 2026</time>, 6–8 pm, Kvirnby
                          school
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
                  </Columns>
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
                        Read about the plans for the square and how you can take part in the
                        dialogue.
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
                    <SummaryList.Root>
                      <SummaryList.Row>
                        <SummaryList.Key>Phone</SummaryList.Key>
                        <SummaryList.Value>
                          <Link.Root href="tel:+46000000001">0000-00 00 01</Link.Root>
                        </SummaryList.Value>
                      </SummaryList.Row>
                      <SummaryList.Row>
                        <SummaryList.Key>Email</SummaryList.Key>
                        <SummaryList.Value>
                          <Link.Root href="mailto:contact@kvirnby.example">
                            contact@kvirnby.example
                          </Link.Root>
                        </SummaryList.Value>
                      </SummaryList.Row>
                      <SummaryList.Row>
                        <SummaryList.Key>Phone hours</SummaryList.Key>
                        <SummaryList.Value>Monday to Thursday 9.00–11.00</SummaryList.Value>
                      </SummaryList.Row>
                    </SummaryList.Root>
                  </Card.Body>
                </Card.Root>
              </Stack>
            </Container>
          </Section>
        </PageFrame.Main>
        <KvirnbyFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: one column, the tiles and cards stacked in DOM order, no sideways scroll. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the hero, the tile grid and the rows mirror; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
