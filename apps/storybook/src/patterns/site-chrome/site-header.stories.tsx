import { LanguageLinks, MainMenu, PageFrame, SiteHeader } from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import { Button, Field, TextInput } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/site-header/site-header.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
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

const description = `The banner of every page: brand, language links, shortcuts, search and the main navigation. Below \`64rem\` the navigation is behind a **Menu** button (a Disclosure, the word and a chevron); from \`64rem\` it is a row. DOM order is reading and focus order at every width, and nothing is sticky.

The pattern holds no text. The organisation's name is text inside \`SiteHeader.Brand\`, the Menu button's word is the text of \`SiteHeader.MenuButton\`, the search field and its button are \`Field\`, \`TextInput\` and \`Button\` that you write, and each navigation's name is its required \`label\`. DOM order is the order you write them in. Use it on every page of a site. For a form or an e-service write the transaction header: a brand and a \`SiteHeader.Service\`, with no search and no menu. For topics with sub-pages, see [With main menu](?path=/story/patterns-site-chrome-site-header--with-main-menu) and [Main menu](?path=/docs/patterns-site-chrome-main-menu--docs).

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`SiteHeader.Root\` | \`<header>\` (banner) with a \`Container\` | The \`<header>\` props |
| \`SiteHeader.Notice\` | \`<div>\` | A line above the brand, for reference sites. Text and links, no heading |
| \`SiteHeader.Topbar\` | \`<div>\` | The row of brand, language links and shortcuts |
| \`SiteHeader.Brand\` | \`<a href>\` | \`href\`, \`current\` (\`page\` on the start page), \`as\` (a router link) |
| \`SiteHeader.Logo\` | \`<img alt="">\` | \`src\`. Decorative: the name is the text beside it |
| \`SiteHeader.Service\` | \`<span>\` | A transaction header's service name |
| \`SiteHeader.Utility\` | \`<nav>\` | \`label\` (required): its name. \`SiteHeader.UtilityLink\`s inside |
| \`SiteHeader.UtilityLink\` | \`<li>\` with \`<a href>\` | \`href\`, \`current\`, \`as\` |
| \`SiteHeader.Search\` | \`<search>\` with a GET \`<form>\` | \`action\` (required). Your \`Field\`, \`TextInput\` and \`Button\` are the children |
| \`SiteHeader.Menu\` | \`<div>\` that owns the open state | \`defaultOpen\` (below \`64rem\`). Escape, focus and close on a link |
| \`SiteHeader.MenuButton\` | \`<button>\` | The word of the button is its children |
| \`SiteHeader.MenuPanel\` | \`<div>\` | Holds the \`MainMenu\` |

The pattern has no strings of its own. Each part is also a flat export (\`SiteHeaderRoot\`, \`SiteHeaderBrand\`, …) for a Server Component.

## Parts and gaps

Parts used: \`Section as="header"\`, \`Container\`, \`Link\`, \`Navigation\`, \`Disclosure\`, \`Field\`, \`TextInput\`, \`Button\`. Gaps in \`@kvirn-ui/react\`: a Site header block, a Search block (the \`<search>\` form is composed here) and the brand link look.
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

/** The start page at the desktop width: brand (current), language links, shortcuts, search and the navigation as a row. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
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
            <LanguageLinks.Link href="#easy-read">Easy read</LanguageLinks.Link>
            <LanguageLinks.Link href="#sign-language">Sign language</LanguageLinks.Link>
          </LanguageLinks.Root>
          <SiteHeader.Utility label="Shortcuts">
            <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
            <SiteHeader.UtilityLink href="#e-services">E-services</SiteHeader.UtilityLink>
            <SiteHeader.UtilityLink href="#my-pages">My pages</SiteHeader.UtilityLink>
          </SiteHeader.Utility>
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
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('banner')).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'Kvirnby municipality' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    for (const name of ['Language', 'Shortcuts']) {
      await expect(canvas.getByRole('navigation', { name })).toBeVisible()
    }
    // The panel keeps `hidden` and the theme shows it from 64rem, so a role query needs `hidden`.
    await expectDrawn(canvas.getByRole('navigation', { name: 'Main menu', hidden: true }))
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Menu' })).toBeNull()
  },
}

/**
 * Topics with sub-pages: a topic is a button that opens its links, the first one the topic's own
 * page. `MainMenu.Link` is a topic without sub-pages. Press a topic to open it.
 */
export const WithMainMenu: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
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
          <SiteHeader.Utility label="Shortcuts">
            <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
            <SiteHeader.UtilityLink href="#e-services">E-services</SiteHeader.UtilityLink>
          </SiteHeader.Utility>
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
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
          <SiteHeader.Service>Parking permit</SiteHeader.Service>
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
        </SiteHeader.Topbar>
      </SiteHeader.Root>
      <PageFrame.Main>
        <h1>Apply for a parking permit</h1>
      </PageFrame.Main>
      <PlaceholderFooter />
    </PageFrame.Root>
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
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
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
          <SiteHeader.Utility label="Shortcuts">
            <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
          </SiteHeader.Utility>
        </SiteHeader.Topbar>
        <SiteHeader.Search action="#search">
          <Field.Root className="kv-site-header-search-field">
            <Field.Label marker="none">Search the site</Field.Label>
            <TextInput type="search" name="q" autoComplete="off" />
          </Field.Root>
          <Button type="submit">Search</Button>
        </SiteHeader.Search>
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
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(canvas.getByRole('navigation', { name: 'Main menu' })).toBeVisible()
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** A reference site's notice above the brand: text and a link, inside the banner. */
export const WithNotice: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Notice>
          <p>
            This is a reference website for KvirnUI. <a href="#about">Read more</a>
          </p>
        </SiteHeader.Notice>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
        </SiteHeader.Topbar>
      </SiteHeader.Root>
      <PageFrame.Main>
        <h1>Welcome to Kvirnby</h1>
      </PageFrame.Main>
      <PlaceholderFooter />
    </PageFrame.Root>
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
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
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
          <SiteHeader.Utility label="Shortcuts">
            <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
          </SiteHeader.Utility>
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
      </PageFrame.Main>
      <PlaceholderFooter />
    </PageFrame.Root>
  ),
  play: async ({ canvas }) => {
    const menu = canvas.getByRole('button', { name: 'Menu' })
    menu.focus()
    await userEvent.keyboard('{Enter}')
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await userEvent.tab()
    await expect(document.activeElement?.closest('nav')).toHaveAccessibleName('Main menu')
    await userEvent.keyboard('{Escape}')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toHaveFocus()
  },
}

/** Right to left: the rows start at the right, and the chevron and links keep their order. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
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
          <SiteHeader.Utility label="Shortcuts">
            <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
          </SiteHeader.Utility>
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
      </PageFrame.Main>
      <PlaceholderFooter />
    </PageFrame.Root>
  ),
}

/** Forced colours: the header keeps its border, links are `LinkText`, the current language keeps its bar. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
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
      </PageFrame.Main>
      <PlaceholderFooter />
    </PageFrame.Root>
  ),
}
