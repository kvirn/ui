import { NavTiles, PageFrame, PageTools } from '@kvirn-ui/patterns'
import { kvirnbySquare } from '@kvirn-ui/patterns/fixtures'
import {
  Breadcrumb,
  Card,
  Container,
  Heading,
  Link,
  List,
  Stack,
  SummaryList,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { KvirnbyFooter, KvirnbyHeader, expectPageOutline } from './kvirnby-chrome.tsx'
// Content types/Subpage: a whole page in the site chrome (docs/design/storybook-patterns.md section 7).
// Story-only: the page is literal JSX of the patterns, which an adopter copies. No data objects.

const description = `A topic page that sends the visitor on: a title, a short preamble and a tile for each child page. Below the tiles come shortcuts, one piece of news and who to ask. It has no section navigation, because the tiles are the navigation. There is no sidebar, so the page is one column at every width.

Written as literal JSX from the patterns: [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs), [Breadcrumb](?path=/docs/components-navigation-breadcrumb--docs), [Nav tiles](?path=/docs/patterns-navigation-and-promotion-nav-tiles--docs), [List](?path=/docs/components-content-list--docs), [Contact card](?path=/docs/patterns-places-and-contacts-contact-card--docs) and [Page tools](?path=/docs/patterns-site-chrome-page-tools--docs). The tiles are \`h2\`, so the page's outline is flat: every block under the \`h1\` is an \`h2\`.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb is before \`main\` and named; nothing is sticky and nothing is reordered with CSS. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Subpage',
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

/** Five child pages as tiles, then shortcuts, one piece of news, the contact card and the page tools. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <KvirnbyHeader />
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
        <Stack gap="8">
          <Stack gap="4">
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
          </NavTiles.Root>
          <Stack gap="4">
            <Heading as="h2" size="heading-3">
              Shortcuts
            </Heading>
            <List.Root gap="2">
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
          <Stack gap="6">
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
                    <Link.Root href="mailto:preschool@kvirnby.example">
                      preschool@kvirnby.example
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
          <PageTools.Root>
            <p className="kv-page-tools-updated">
              Last updated: <time dateTime="2026-10-02">2 October 2026</time>
            </p>
            <PageTools.CopyLink>Copy link</PageTools.CopyLink>
            <PageTools.Print>Print</PageTools.Print>
          </PageTools.Root>
        </Stack>
      </PageFrame.Main>
      <KvirnbyFooter />
    </PageFrame.Root>
  ),
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** A topic with three children: the tiles fill one row. */
export const ThreeChildren: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <KvirnbyHeader />
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
        <Stack gap="8">
          <Stack gap="4">
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
          </NavTiles.Root>
          <Stack gap="4">
            <Heading as="h2" size="heading-3">
              Shortcuts
            </Heading>
            <List.Root gap="2">
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
          <Stack gap="6">
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
                    <Link.Root href="mailto:preschool@kvirnby.example">
                      preschool@kvirnby.example
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
          <PageTools.Root>
            <p className="kv-page-tools-updated">
              Last updated: <time dateTime="2026-10-02">2 October 2026</time>
            </p>
            <PageTools.CopyLink>Copy link</PageTools.CopyLink>
            <PageTools.Print>Print</PageTools.Print>
          </PageTools.Root>
        </Stack>
      </PageFrame.Main>
      <KvirnbyFooter />
    </PageFrame.Root>
  ),
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** A topic with seven children: the tiles wrap into rows; the order is still the DOM order. */
export const SevenChildren: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <KvirnbyHeader />
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
        <Stack gap="8">
          <Stack gap="4">
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
          </NavTiles.Root>
          <Stack gap="4">
            <Heading as="h2" size="heading-3">
              Shortcuts
            </Heading>
            <List.Root gap="2">
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
          <Stack gap="6">
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
                    <Link.Root href="mailto:preschool@kvirnby.example">
                      preschool@kvirnby.example
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
          <PageTools.Root>
            <p className="kv-page-tools-updated">
              Last updated: <time dateTime="2026-10-02">2 October 2026</time>
            </p>
            <PageTools.CopyLink>Copy link</PageTools.CopyLink>
            <PageTools.Print>Print</PageTools.Print>
          </PageTools.Root>
        </Stack>
      </PageFrame.Main>
      <KvirnbyFooter />
    </PageFrame.Root>
  ),
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: one column of tiles, no sideways scroll. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the tile grid mirrors; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
