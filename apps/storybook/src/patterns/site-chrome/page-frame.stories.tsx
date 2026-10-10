import { en } from '@kvirn-ui/i18n/en'
import { LanguageLinks, MainMenu, PageFrame, SiteHeader } from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import { Button, Field, KvirnProvider, Link, Navigation, TextInput } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/page-frame/page-frame.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import {
  PlaceholderFooter,
  chromeViewports,
  narrowGlobals,
  wideGlobals,
} from '../patterns-story-support.tsx'

// Patterns/Site chrome/Page frame (docs/design/storybook-patterns.md section 4).

const description = `The frame of every page: a skip link first, then your children in the order you write them: the banner, an optional site alert and breadcrumb, \`main\`, and the \`contentinfo\`. DOM order is reading order and focus order at every width. Nothing is sticky and nothing is reordered with CSS \`order\`.

The page's language comes from the nearest \`KvirnProvider\` (and \`<html lang>\`), so the library's own strings (the skip link, the status words) and your content agree (3.1.1). The frame holds no text of its own. A page with a section navigation wraps \`PageFrame.Sidebar\` and \`PageFrame.Main\` in \`PageFrame.Body\`: the sidebar sits beside \`main\` from \`64rem\` and stacks above it below.

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`PageFrame.Root\` | \`<div>\` with the skip link first | \`mainId\`: the skip link's target, default \`main\` |
| \`PageFrame.Main\` | \`<main id>\` in a \`Container\` | \`id\` (default the root's \`mainId\`). The one \`main\` of the page |
| \`PageFrame.Body\` | \`<div>\` in a \`Container\` | Only with a sidebar. Holds \`PageFrame.Sidebar\` and \`PageFrame.Main\` |
| \`PageFrame.Sidebar\` | \`<nav>\` or \`<aside>\` | \`as\`. Write it before \`PageFrame.Main\`; it needs a name |

The header, alert, breadcrumb and footer are children of the root, in the order they take on the page. Each part is also a flat export (\`PageFrameRoot\`, \`PageFrameMain\`, …).

## Parts and gaps

Parts used: \`SkipLink\`, \`Container\`, \`SidebarLayout\`. No gap.
`

const meta = {
  title: 'Patterns/Site chrome/Page frame',
  component: PageFrame.Root,
  argTypes: {
    mainId: { control: 'text', description: 'The id of `main`. Default `main`.' },
  },
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: a page with header, `main` and footer. The skip link shows on the first Tab. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Topbar>
            <SiteHeader.Brand href="#start" current="page">
              <SiteHeader.Logo src={kvirnbyMark} />
              Kvirnby municipality
            </SiteHeader.Brand>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
          </SiteHeader.Topbar>
          <SiteHeader.Search action="#search">
            <Field.Root className="kv-site-header-search-field">
              <Field.Label marker="none">Search the site</Field.Label>
              <TextInput type="search" name="q" autoComplete="off" />
            </Field.Root>
            <Button type="submit">Search</Button>
          </SiteHeader.Search>
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
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    await expect(canvas.getAllByRole('main')).toHaveLength(1)
    await expect(canvas.getAllByRole('contentinfo')).toHaveLength(1)
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main',
    )
  },
}

/** At 320px: one column, the header in rows, no sideways scroll. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Topbar>
            <SiteHeader.Brand href="#start" current="page">
              <SiteHeader.Logo src={kvirnbyMark} />
              Kvirnby municipality
            </SiteHeader.Brand>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
          </SiteHeader.Topbar>
          <SiteHeader.Search action="#search">
            <Field.Root className="kv-site-header-search-field">
              <Field.Label marker="none">Search the site</Field.Label>
              <TextInput type="search" name="q" autoComplete="off" />
            </Field.Root>
            <Button type="submit">Search</Button>
          </SiteHeader.Search>
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
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/**
 * A page with a section navigation: `PageFrame.Body` holds `PageFrame.Sidebar` and
 * `PageFrame.Main`, the sidebar first in the DOM. From `64rem` it sits beside `main`.
 */
export const WithSidebar: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Topbar>
            <SiteHeader.Brand href="#start">
              <SiteHeader.Logo src={kvirnbyMark} />
              Kvirnby municipality
            </SiteHeader.Brand>
          </SiteHeader.Topbar>
        </SiteHeader.Root>
        <PageFrame.Body>
          <PageFrame.Sidebar as="nav" aria-label="In this section">
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#preschool" current="page">
                  Preschool
                </Link.Root>
              </Navigation.Item>
              <Navigation.Item>
                <Link.Root href="#apply">Apply for a place</Link.Root>
              </Navigation.Item>
              <Navigation.Item>
                <Link.Root href="#fees">Fees</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </PageFrame.Sidebar>
          <PageFrame.Main>
            <h1>Preschool</h1>
            <p>Find information about preschool in Kvirnby municipality.</p>
          </PageFrame.Main>
        </PageFrame.Body>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'In this section' })).toBeVisible()
    await expect(canvas.getAllByRole('main')).toHaveLength(1)
  },
}

/** Try the keys (see Keyboard above): the skip link is the first Tab stop and moves focus to `main`. */
export const Keyboard: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Topbar>
            <SiteHeader.Brand href="#start" current="page">
              <SiteHeader.Logo src={kvirnbyMark} />
              Kvirnby municipality
            </SiteHeader.Brand>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
          </SiteHeader.Topbar>
          <SiteHeader.Search action="#search">
            <Field.Root className="kv-site-header-search-field">
              <Field.Label marker="none">Search the site</Field.Label>
              <TextInput type="search" name="q" autoComplete="off" />
            </Field.Root>
            <Button type="submit">Search</Button>
          </SiteHeader.Search>
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
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    await expect(canvas.getAllByRole('main')).toHaveLength(1)
    await expect(canvas.getAllByRole('contentinfo')).toHaveLength(1)
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main',
    )
  },
}

/** Right to left: the whole frame mirrors; DOM order is unchanged. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Topbar>
            <SiteHeader.Brand href="#start" current="page">
              <SiteHeader.Logo src={kvirnbyMark} />
              Kvirnby municipality
            </SiteHeader.Brand>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
          </SiteHeader.Topbar>
          <SiteHeader.Search action="#search">
            <Field.Root className="kv-site-header-search-field">
              <Field.Label marker="none">Search the site</Field.Label>
              <TextInput type="search" name="q" autoComplete="off" />
            </Field.Root>
            <Button type="submit">Search</Button>
          </SiteHeader.Search>
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
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument()
  },
}

/** Forced colours: sections keep their borders. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <SiteHeader.Root>
          <SiteHeader.Topbar>
            <SiteHeader.Brand href="#start" current="page">
              <SiteHeader.Logo src={kvirnbyMark} />
              Kvirnby municipality
            </SiteHeader.Brand>
            <LanguageLinks.Root label="Language">
              <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
                Svenska
              </LanguageLinks.Link>
              <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
                English
              </LanguageLinks.Link>
            </LanguageLinks.Root>
          </SiteHeader.Topbar>
          <SiteHeader.Search action="#search">
            <Field.Root className="kv-site-header-search-field">
              <Field.Label marker="none">Search the site</Field.Label>
              <TextInput type="search" name="q" autoComplete="off" />
            </Field.Root>
            <Button type="submit">Search</Button>
          </SiteHeader.Search>
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
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    await expect(canvas.getAllByRole('main')).toHaveLength(1)
    await expect(canvas.getAllByRole('contentinfo')).toHaveLength(1)
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main',
    )
  },
}
