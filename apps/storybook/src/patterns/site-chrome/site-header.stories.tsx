import { en } from '@kvirn-ui/i18n/en'
import {
  ApplicationLogo,
  LanguageLinks,
  MainMenu,
  PageFrame,
  SiteHeader,
  SiteSearch,
} from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import { DisplaySettings, KvirnProvider, Link, Navigation, TopBar } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/site-header/site-header.a11y.md?raw'
import {
  expectAnimationsSettled,
  expectNoHorizontalOverflow,
  expectTopBarTargetSizes,
} from '../../components/theme-story-assertions.ts'
import {
  PlaceholderFooter,
  chromeViewports,
  expectDrawn,
  narrowGlobals,
  wideGlobals,
} from '../patterns-story-support.tsx'

// Patterns/Site chrome/Site header: the banner of every page (docs/design/storybook-patterns.md
// section 5.1). A composition of shipped parts. Each story is the code an adopter copies, so
// "Show code" is the documentation: literal JSX, literal text, no data objects.

const description = `The banner of every page: application logo, language links, shortcuts, search and the main navigation. Below \`64rem\` the navigation is behind a **Menu** button (a Disclosure, the word and a chevron); from \`64rem\` it is a row. DOM order is reading and focus order at every width, and nothing is sticky.

The pattern holds no text. Put an [Application logo](?path=/docs/patterns-site-chrome-application-logo--docs) and a [Site search](?path=/docs/patterns-site-chrome-site-search--docs) in the \`SiteHeader.Masthead\` yourself. The Menu button's word is the text of \`SiteHeader.MenuButton\`, and each navigation's name is its required \`label\`. DOM order is the order you write them in. Use it on every page of a site. For a form or an e-service write the transaction header: the application logo and the service's name as text, with no search and no menu. For topics with sub-pages, see [With main menu](?path=/story/patterns-site-chrome-site-header--with-main-menu) and [Primary navigation](?path=/docs/components-navigation-primary-navigation--docs).

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`SiteHeader.Root\` | \`<header>\` (banner) with a \`Container\` | The \`<header>\` props. \`variant\`: \`canvas\` (default) or \`primary\`, three full-width \`primary\` bands (a \`TopBar\` first is the darker top bar) |
| \`SiteHeader.Masthead\` | \`<div>\` | The brand row: the row of the \`ApplicationLogo\`, language links, shortcuts and \`SiteSearch\` |
| \`SiteHeader.Utility\` | \`<nav>\` | \`label\` (required): its name. \`SiteHeader.UtilityLink\`s inside |
| \`SiteHeader.UtilityLink\` | \`<li>\` with \`<a href>\` | \`href\`, \`current\`, \`as\` |
| \`SiteHeader.Menu\` | \`<div>\` that owns the open state | \`defaultOpen\` (below \`64rem\`). Escape, focus and close on a link. After the \`Masthead\`, or inside it between the logo and the search: two bands (see \`PrimaryMastheadMenu\`) |
| \`SiteHeader.MenuButton\` | \`<button>\` | The word of the button is its children |
| \`SiteHeader.MenuPanel\` | \`<div>\` | Holds the \`MainMenu\` |

The pattern has no strings of its own. Each part is also a flat export (\`SiteHeaderRoot\`, \`SiteHeaderMasthead\`, …) for a Server Component.

## Parts and gaps

Parts used: \`Section as="header"\`, \`Container\`, \`Link\`, \`Navigation\`, \`Disclosure\`, and the \`ApplicationLogo\` and \`SiteSearch\` patterns. Gap in \`@kvirn-ui/react\`: a Site header block.
`

const meta = {
  title: 'Patterns/Site chrome/Site header',
  component: SiteHeader.Root,
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof SiteHeader.Root>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The start page at the desktop width, with the same parts as the primary header and none of its
 * styling: the top bar with the tools, the application logo (current) and the site search, and the
 * navigation as a row. `variant="primary"` below is this header on three `primary` bands.
 */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <TopBar>
            <p>
              A KvirnUI reference site. <Link.Root href="#releases">Latest: Pre-alpha</Link.Root>
            </p>
            <Navigation.Root label="Tools" className="kv-navigation--horizontal">
              <Navigation.List>
                <Navigation.Item>
                  <Link.Root href="#documentation" current>
                    Documentation
                  </Link.Root>
                </Navigation.Item>
                <Navigation.Item>
                  <Link.Root href="#github">GitHub</Link.Root>
                </Navigation.Item>
              </Navigation.List>
            </Navigation.Root>
          </TopBar>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start" current="page">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
          <SiteHeader.Menu>
            <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <MainMenu.Root label="Main menu">
                <MainMenu.Topic>
                  <MainMenu.TopicButton>Preschool and school</MainMenu.TopicButton>
                  <MainMenu.TopicPanel>
                    <MainMenu.Overview href="#school">
                      All about preschool and school
                    </MainMenu.Overview>
                    <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
                    <MainMenu.Link href="#primary-school">Primary school</MainMenu.Link>
                  </MainMenu.TopicPanel>
                </MainMenu.Topic>
                <MainMenu.Topic>
                  <MainMenu.TopicButton>Care and support</MainMenu.TopicButton>
                  <MainMenu.TopicPanel>
                    <MainMenu.Overview href="#care">All about care and support</MainMenu.Overview>
                    <MainMenu.Link href="#elderly">Elderly care</MainMenu.Link>
                    <MainMenu.Link href="#disability">Disability support</MainMenu.Link>
                  </MainMenu.TopicPanel>
                </MainMenu.Topic>
                <MainMenu.Link href="#living">Living and environment</MainMenu.Link>
                <MainMenu.Link href="#culture">Culture and leisure</MainMenu.Link>
                <MainMenu.Link href="#business">Business and work</MainMenu.Link>
              </MainMenu.Root>
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'Kvirnby municipality' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(canvas.getByRole('navigation', { name: 'Tools' })).toBeVisible()
    // The panel keeps `hidden` and the theme shows it from 64rem, so a role query needs `hidden`.
    await expectDrawn(canvas.getByRole('navigation', { name: 'Main menu', hidden: true }))
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Menu' })).toBeNull()
  },
}

/**
 * `variant="primary"`: three full-width `primary` bands, their content on the Container's edge.
 * The `TopBar` is the darker top bar with a `Navigation` of tools, the Masthead holds the
 * application logo and the site search, and the Menu is the navigation band. The current item is weight 600 and a bar.
 */
export const Primary: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root variant="primary">
          <TopBar>
            <Link.Root href="#releases">Latest: Pre-alpha</Link.Root>
            <div className="kv-story-top-end">
              <Navigation.Root label="Tools" className="kv-navigation--horizontal">
                <Navigation.List>
                  <Navigation.Item>
                    <Link.Root href="#documentation" current>
                      Documentation
                    </Link.Root>
                  </Navigation.Item>
                  <Navigation.Item>
                    <Link.Root href="#github">GitHub</Link.Root>
                  </Navigation.Item>
                </Navigation.List>
              </Navigation.Root>
              <DisplaySettings.Compact className="kv-button--link" />
            </div>
          </TopBar>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
          <SiteHeader.Menu>
            <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <MainMenu.Root label="Main menu">
                <MainMenu.Topic>
                  <MainMenu.TopicButton>Preschool and school</MainMenu.TopicButton>
                  <MainMenu.TopicPanel>
                    <MainMenu.Overview href="#school">
                      All about preschool and school
                    </MainMenu.Overview>
                    <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
                    <MainMenu.Link href="#primary-school">Primary school</MainMenu.Link>
                  </MainMenu.TopicPanel>
                </MainMenu.Topic>
                <MainMenu.Topic>
                  <MainMenu.TopicButton>Care and support</MainMenu.TopicButton>
                  <MainMenu.TopicPanel>
                    <MainMenu.Overview href="#care">All about care and support</MainMenu.Overview>
                    <MainMenu.Link href="#elderly">Elderly care</MainMenu.Link>
                    <MainMenu.Link href="#disability">Disability support</MainMenu.Link>
                  </MainMenu.TopicPanel>
                </MainMenu.Topic>
                <MainMenu.Link href="#living" current="page">
                  Living and environment
                </MainMenu.Link>
                <MainMenu.Link href="#culture">Culture and leisure</MainMenu.Link>
                <MainMenu.Link href="#business">Business and work</MainMenu.Link>
              </MainMenu.Root>
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Living and environment</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expectTopBarTargetSizes(canvasElement)
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    await expect(canvas.getByRole('navigation', { name: 'Tools' })).toBeVisible()
    await expectDrawn(canvas.getByRole('navigation', { name: 'Main menu', hidden: true }))
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Search' })).toBeVisible()
  },
}

/** The primary bands at 320px with the Menu and a topic open: the tools wrap and stay, the navigation is a column, and the topic's links sit on the band with the on-primary ring. */
export const PrimaryMenuOpen: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root variant="primary">
          <TopBar>
            <p>
              A KvirnUI reference site. <Link.Root href="#releases">Latest: Pre-alpha</Link.Root>
            </p>
            <Navigation.Root label="Tools" className="kv-navigation--horizontal">
              <Navigation.List>
                <Navigation.Item>
                  <Link.Root href="#documentation" current>
                    Documentation
                  </Link.Root>
                </Navigation.Item>
                <Navigation.Item>
                  <Link.Root href="#github">GitHub</Link.Root>
                </Navigation.Item>
              </Navigation.List>
            </Navigation.Root>
          </TopBar>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
          <SiteHeader.Menu defaultOpen>
            <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <MainMenu.Root label="Main menu">
                <MainMenu.Topic>
                  <MainMenu.TopicButton>Care and support</MainMenu.TopicButton>
                  <MainMenu.TopicPanel>
                    <MainMenu.Overview href="#care">All about care and support</MainMenu.Overview>
                    <MainMenu.Link href="#elderly">Elderly care</MainMenu.Link>
                  </MainMenu.TopicPanel>
                </MainMenu.Topic>
                <MainMenu.Link href="#living" current="page">
                  Living and environment
                </MainMenu.Link>
                <MainMenu.Link href="#culture">Culture and leisure</MainMenu.Link>
              </MainMenu.Root>
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Living and environment</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expectAnimationsSettled()
    await expect(canvas.getByRole('link', { name: 'Documentation' })).toBeVisible()
    await expect(canvas.getByRole('navigation', { name: 'Main menu' })).toBeVisible()
    const topic = canvas.getByRole('button', { name: 'Care and support' })
    await userEvent.click(topic)
    await expect(topic).toHaveAttribute('aria-expanded', 'true')
    await expectAnimationsSettled()
    await expect(canvas.getByRole('link', { name: 'Elderly care' })).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** The primary bands right to left: each band starts at the right, the bars and chevrons follow. */
export const PrimaryRTL: Story = {
  ...Primary,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** The primary bands in forced colours: the fills drop to Canvas and a CanvasText edge keeps the bands apart. */
export const PrimaryForcedColors: Story = {
  ...Primary,
  globals: { forcedColors: 'active', ...wideGlobals },
}

/** The two-band primary header: the top bar, then one masthead row with the logo, the topics and the search at the end. From `64rem` the topics are always shown; below it the Menu is a full-width row. */
export const PrimaryMastheadMenu: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root variant="primary">
          <TopBar>
            <p>
              A KvirnUI reference site. <Link.Root href="#releases">Latest: Pre-alpha</Link.Root>
            </p>
            <Navigation.Root label="Tools" className="kv-navigation--horizontal">
              <Navigation.List>
                <Navigation.Item>
                  <Link.Root href="#documentation" current>
                    Documentation
                  </Link.Root>
                </Navigation.Item>
                <Navigation.Item>
                  <Link.Root href="#github">GitHub</Link.Root>
                </Navigation.Item>
              </Navigation.List>
            </Navigation.Root>
          </TopBar>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <SiteHeader.Menu>
              <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
              <SiteHeader.MenuPanel>
                <MainMenu.Root label="Main menu">
                  <MainMenu.Topic>
                    <MainMenu.TopicButton>Preschool and school</MainMenu.TopicButton>
                    <MainMenu.TopicPanel>
                      <MainMenu.Overview href="#school">
                        All about preschool and school
                      </MainMenu.Overview>
                      <MainMenu.Group>
                        <MainMenu.GroupLink href="#preschool">Preschool</MainMenu.GroupLink>
                        <Navigation.List>
                          <MainMenu.Link href="#apply">Apply for a place</MainMenu.Link>
                          <MainMenu.Link href="#fees">Fees</MainMenu.Link>
                        </Navigation.List>
                      </MainMenu.Group>
                      <MainMenu.Group>
                        <MainMenu.GroupLink href="#compulsory">
                          Compulsory school
                        </MainMenu.GroupLink>
                        <Navigation.List>
                          <MainMenu.Link href="#primary-school">Primary school</MainMenu.Link>
                          <MainMenu.Link href="#lower-secondary">
                            Lower secondary school
                          </MainMenu.Link>
                        </Navigation.List>
                      </MainMenu.Group>
                      <MainMenu.Group>
                        <Navigation.Label>Support at school</Navigation.Label>
                        <Navigation.List>
                          <MainMenu.Link href="#student-health">Student health</MainMenu.Link>
                          <MainMenu.Link href="#special-support">Special support</MainMenu.Link>
                        </Navigation.List>
                      </MainMenu.Group>
                    </MainMenu.TopicPanel>
                  </MainMenu.Topic>
                  <MainMenu.Link href="#care">Care and support</MainMenu.Link>
                  <MainMenu.Link href="#living" current="page">
                    Living and environment
                  </MainMenu.Link>
                  <MainMenu.Link href="#culture">Culture and leisure</MainMenu.Link>
                </MainMenu.Root>
              </SiteHeader.MenuPanel>
            </SiteHeader.Menu>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Living and environment</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    await expectDrawn(canvas.getByRole('navigation', { name: 'Main menu', hidden: true }))
    await expect(canvas.getByRole('button', { name: 'Preschool and school' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
  },
}

/** A topic with grouped links open: the overview on its own row, then the groups as columns under the masthead. A group with no page has a label instead of a link. */
export const PrimaryMastheadMenuOpen: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root variant="primary">
          <TopBar>
            <p>
              A KvirnUI reference site. <Link.Root href="#releases">Latest: Pre-alpha</Link.Root>
            </p>
            <Navigation.Root label="Tools" className="kv-navigation--horizontal">
              <Navigation.List>
                <Navigation.Item>
                  <Link.Root href="#documentation" current>
                    Documentation
                  </Link.Root>
                </Navigation.Item>
                <Navigation.Item>
                  <Link.Root href="#github">GitHub</Link.Root>
                </Navigation.Item>
              </Navigation.List>
            </Navigation.Root>
          </TopBar>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <SiteHeader.Menu>
              <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
              <SiteHeader.MenuPanel>
                <MainMenu.Root label="Main menu">
                  <MainMenu.Topic>
                    <MainMenu.TopicButton>Preschool and school</MainMenu.TopicButton>
                    <MainMenu.TopicPanel>
                      <MainMenu.Overview href="#school">
                        All about preschool and school
                      </MainMenu.Overview>
                      <MainMenu.Group>
                        <MainMenu.GroupLink href="#preschool">Preschool</MainMenu.GroupLink>
                        <Navigation.List>
                          <MainMenu.Link href="#apply">Apply for a place</MainMenu.Link>
                          <MainMenu.Link href="#fees">Fees</MainMenu.Link>
                        </Navigation.List>
                      </MainMenu.Group>
                      <MainMenu.Group>
                        <MainMenu.GroupLink href="#compulsory">
                          Compulsory school
                        </MainMenu.GroupLink>
                        <Navigation.List>
                          <MainMenu.Link href="#primary-school">Primary school</MainMenu.Link>
                          <MainMenu.Link href="#lower-secondary">
                            Lower secondary school
                          </MainMenu.Link>
                        </Navigation.List>
                      </MainMenu.Group>
                      <MainMenu.Group>
                        <Navigation.Label>Support at school</Navigation.Label>
                        <Navigation.List>
                          <MainMenu.Link href="#student-health">Student health</MainMenu.Link>
                          <MainMenu.Link href="#special-support">Special support</MainMenu.Link>
                        </Navigation.List>
                      </MainMenu.Group>
                    </MainMenu.TopicPanel>
                  </MainMenu.Topic>
                  <MainMenu.Link href="#care">Care and support</MainMenu.Link>
                  <MainMenu.Link href="#living" current="page">
                    Living and environment
                  </MainMenu.Link>
                  <MainMenu.Link href="#culture">Culture and leisure</MainMenu.Link>
                </MainMenu.Root>
              </SiteHeader.MenuPanel>
            </SiteHeader.Menu>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Living and environment</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    const topic = canvas.getByRole('button', { name: 'Preschool and school' })
    await userEvent.click(topic)
    await expect(topic).toHaveAttribute('aria-expanded', 'true')
    await expectAnimationsSettled()
    await expect(canvas.getByRole('link', { name: 'All about preschool and school' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Preschool' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Fees' })).toBeVisible()
    await expect(canvas.getByRole('list', { name: 'Support at school' })).toBeVisible()
  },
}

/** At 320px the Menu is a full-width row, the opened topic is in flow before the search, and the search is full width. */
export const PrimaryMastheadMenuNarrow: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root variant="primary">
          <TopBar>
            <p>
              A KvirnUI reference site. <Link.Root href="#releases">Latest: Pre-alpha</Link.Root>
            </p>
            <Navigation.Root label="Tools" className="kv-navigation--horizontal">
              <Navigation.List>
                <Navigation.Item>
                  <Link.Root href="#documentation" current>
                    Documentation
                  </Link.Root>
                </Navigation.Item>
                <Navigation.Item>
                  <Link.Root href="#github">GitHub</Link.Root>
                </Navigation.Item>
              </Navigation.List>
            </Navigation.Root>
          </TopBar>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <SiteHeader.Menu defaultOpen>
              <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
              <SiteHeader.MenuPanel>
                <MainMenu.Root label="Main menu">
                  <MainMenu.Topic>
                    <MainMenu.TopicButton>Preschool and school</MainMenu.TopicButton>
                    <MainMenu.TopicPanel>
                      <MainMenu.Overview href="#school">
                        All about preschool and school
                      </MainMenu.Overview>
                      <MainMenu.Group>
                        <MainMenu.GroupLink href="#preschool">Preschool</MainMenu.GroupLink>
                        <Navigation.List>
                          <MainMenu.Link href="#apply">Apply for a place</MainMenu.Link>
                          <MainMenu.Link href="#fees">Fees</MainMenu.Link>
                        </Navigation.List>
                      </MainMenu.Group>
                      <MainMenu.Group>
                        <Navigation.Label>Support at school</Navigation.Label>
                        <Navigation.List>
                          <MainMenu.Link href="#student-health">Student health</MainMenu.Link>
                        </Navigation.List>
                      </MainMenu.Group>
                    </MainMenu.TopicPanel>
                  </MainMenu.Topic>
                  <MainMenu.Link href="#living" current="page">
                    Living and environment
                  </MainMenu.Link>
                </MainMenu.Root>
              </SiteHeader.MenuPanel>
            </SiteHeader.Menu>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Living and environment</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    const menu = canvas.getByRole('button', { name: 'Menu' })
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    const topic = canvas.getByRole('button', { name: 'Preschool and school' })
    await userEvent.click(topic)
    await expect(topic).toHaveAttribute('aria-expanded', 'true')
    await expectAnimationsSettled()
    await expect(canvas.getByRole('link', { name: 'Fees' })).toBeVisible()
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** The two-band header with a grouped topic open, right to left: the columns start at the right. */
export const PrimaryMastheadMenuRTL: Story = {
  ...PrimaryMastheadMenuOpen,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** The two-band header with a grouped topic open in forced colours: the panel keeps its CanvasText edge and links are LinkText. */
export const PrimaryMastheadMenuForcedColors: Story = {
  ...PrimaryMastheadMenuOpen,
  globals: { forcedColors: 'active', ...wideGlobals },
}

/**
 * Topics with sub-pages: a topic is a button that opens its links, the first one the topic's own
 * page. `MainMenu.Link` is a topic without sub-pages. Press a topic to open it.
 */
export const WithMainMenu: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
            <SiteHeader.Utility label="Shortcuts">
              <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
              <SiteHeader.UtilityLink href="#e-services">E-services</SiteHeader.UtilityLink>
            </SiteHeader.Utility>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
          <SiteHeader.Menu>
            <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <MainMenu.Root label="Main menu">
                <MainMenu.Link href="#school">Preschool</MainMenu.Link>
                <MainMenu.Topic>
                  <MainMenu.TopicButton>Living and environment</MainMenu.TopicButton>
                  <MainMenu.TopicPanel>
                    <MainMenu.Overview href="#living">
                      All about living and environment
                    </MainMenu.Overview>
                    <MainMenu.Link href="#waste">Waste and recycling</MainMenu.Link>
                    <MainMenu.Link href="#building">Building permits</MainMenu.Link>
                    <MainMenu.Link href="#water">Water and sewage</MainMenu.Link>
                  </MainMenu.TopicPanel>
                </MainMenu.Topic>
                <MainMenu.Topic>
                  <MainMenu.TopicButton>Care and support</MainMenu.TopicButton>
                  <MainMenu.TopicPanel>
                    <MainMenu.Overview href="#care">All about care and support</MainMenu.Overview>
                    <MainMenu.Link href="#elderly">Elderly care</MainMenu.Link>
                    <MainMenu.Link href="#disability">Disability support</MainMenu.Link>
                  </MainMenu.TopicPanel>
                </MainMenu.Topic>
                <MainMenu.Link href="#culture">Culture and leisure</MainMenu.Link>
              </MainMenu.Root>
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    const topic = canvas.getByRole('button', { name: 'Living and environment', hidden: true })
    await userEvent.click(topic)
    await expect(topic).toHaveAttribute('aria-expanded', 'true')
    await expectDrawn(
      canvas.getByRole('link', { name: 'All about living and environment', hidden: true }),
    )
  },
}

/** A transaction header: identity and help during a form, nothing to wander off to. */
export const Transaction: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <span>Parking permit</span>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
            <SiteHeader.Utility label="Shortcuts">
              <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
            </SiteHeader.Utility>
          </SiteHeader.Masthead>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Apply for a parking permit</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('search')).toBeNull()
    await expect(canvas.queryByRole('button', { name: 'Menu' })).toBeNull()
    await expect(canvas.getByText('Parking permit')).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** The Menu open at 320px: the main navigation is a column of rows under the button, pushing the page down. */
export const MenuOpen: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
            <SiteHeader.Utility label="Shortcuts">
              <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
            </SiteHeader.Utility>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
          <SiteHeader.Menu defaultOpen>
            <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <MainMenu.Root label="Main menu">
                <MainMenu.Link href="#school">Preschool and school</MainMenu.Link>
                <MainMenu.Link href="#care">Care and support</MainMenu.Link>
                <MainMenu.Link href="#living">Living and environment</MainMenu.Link>
                <MainMenu.Link href="#culture">Culture and leisure</MainMenu.Link>
              </MainMenu.Root>
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expectAnimationsSettled()
    await expect(canvas.getByRole('navigation', { name: 'Main menu' })).toBeVisible()
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** A reference site's top bar above the brand: a `TopBar` with text and a link, inside the banner. */
export const WithTopBar: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <TopBar>
            <p>
              This is a reference website for KvirnUI.{' '}
              <Link.Root href="#about">Read more</Link.Root>
            </p>
          </TopBar>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
          </SiteHeader.Masthead>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
}

/**
 * Try the keys (see Keyboard above): Tab moves through the brand, the language links, the
 * shortcuts, the search field and button, then Menu. Enter or Space on Menu opens the navigation,
 * and Escape inside it closes it and returns focus to Menu.
 */
export const Keyboard: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
            <SiteHeader.Utility label="Shortcuts">
              <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
            </SiteHeader.Utility>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
          <SiteHeader.Menu>
            <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <MainMenu.Root label="Main menu">
                <MainMenu.Topic>
                  <MainMenu.TopicButton>Preschool and school</MainMenu.TopicButton>
                  <MainMenu.TopicPanel>
                    <MainMenu.Overview href="#school">
                      All about preschool and school
                    </MainMenu.Overview>
                    <MainMenu.Group>
                      <MainMenu.GroupLink href="#preschool">Preschool</MainMenu.GroupLink>
                      <Navigation.List>
                        <MainMenu.Link href="#fees">Fees</MainMenu.Link>
                      </Navigation.List>
                    </MainMenu.Group>
                  </MainMenu.TopicPanel>
                </MainMenu.Topic>
                <MainMenu.Link href="#care">Care and support</MainMenu.Link>
              </MainMenu.Root>
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    const menu = canvas.getByRole('button', { name: 'Menu' })
    menu.focus()
    await userEvent.keyboard('{Enter}')
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await userEvent.tab()
    await expect(document.activeElement?.closest('nav')).toHaveAccessibleName('Main menu')
    const topic = canvas.getByRole('button', { name: 'Preschool and school' })
    await expect(topic).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Preschool' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect(topic).toHaveAttribute('aria-expanded', 'false')
    await expect(topic).toHaveFocus()
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toHaveFocus()
  },
}

/** Right to left: the rows start at the right, and the chevron and links keep their order. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
            <SiteHeader.Utility label="Shortcuts">
              <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
            </SiteHeader.Utility>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
          <SiteHeader.Menu>
            <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <MainMenu.Root label="Main menu">
                <MainMenu.Link href="#school">Preschool and school</MainMenu.Link>
                <MainMenu.Link href="#care">Care and support</MainMenu.Link>
              </MainMenu.Root>
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
}

/** Forced colours: the header keeps its border, links are `LinkText`, the current language keeps its bar. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Masthead>
            <ApplicationLogo.Root href="#start">
              <ApplicationLogo.Logo src={kvirnbyMark} />
              <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
            </ApplicationLogo.Root>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
            <SiteSearch action="#search" label="Search the site">
              Search
            </SiteSearch>
          </SiteHeader.Masthead>
          <SiteHeader.Menu>
            <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
            <SiteHeader.MenuPanel>
              <MainMenu.Root label="Main menu">
                <MainMenu.Link href="#school">Preschool and school</MainMenu.Link>
                <MainMenu.Link href="#care">Care and support</MainMenu.Link>
              </MainMenu.Root>
            </SiteHeader.MenuPanel>
          </SiteHeader.Menu>
        </SiteHeader.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
}
