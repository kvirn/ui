import { CookieConsent, MainMenu, PageFrame, SiteHeader } from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import { Button, Field, TextInput } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/cookie-consent/cookie-consent.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import {
  PlaceholderFooter,
  chromeViewports,
  narrowGlobals,
  wideGlobals,
} from '../patterns-story-support.tsx'

// Patterns/Site chrome/Cookie consent (docs/design/storybook-patterns.md section 5.6). Story only.
// Each story is the code an adopter copies: literal JSX, literal text.

const description = `A request for consent to statistics cookies, in the page's flow, first after the skip link. It is **not a dialog**: nothing is modal, nothing is trapped and nothing is \`inert\`, so the page is usable without answering. The two buttons are equal in look (no primary, no dark pattern) and nothing is pre-ticked.

After a choice the region shows the result, and focus moves to that text, never to \`body\`. It is not announced: focus on it makes a screen reader read it. There is no settings dialog in v1: the link goes to the Cookies page.

**Kvirnby sets no cookies.** The pattern is story only: storing the choice and setting cookies are the site's, and the ePrivacy wording of a real site needs a legal check (\`TODO(legal-verify)\`).

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`CookieConsent.Root\` | \`<section>\`, named by its heading | \`defaultDecision\`: \`accepted\` or \`rejected\`, to start answered. \`onDecision\`. State: \`data-decision\` |
| \`CookieConsent.Heading\` | \`<h2>\` | The region's name: \`Cookies on this website\` |
| \`CookieConsent.Text\` | \`<div>\` (Prose) | What the cookies are for, in plain words. Gone after a choice |
| \`CookieConsent.Actions\` | \`<div>\` button group | Holds Accept and Reject. Gone after a choice |
| \`CookieConsent.Accept\`, \`.Reject\` | \`<button>\` | The button's words are its children |
| \`CookieConsent.Accepted\`, \`.Rejected\` | \`<p tabindex="-1">\` | Shown after that choice, and focus moves to it. What was chosen and where to change it, as children |
| \`CookieConsent.Link\` | \`<p>\` with \`<a href>\` | The Cookies page. Always shown |

The pattern has no strings of its own. Each part is also a flat export (\`CookieConsentRoot\`, \`CookieConsentAccept\`, …).

## Parts and gaps

Parts used: \`Section as="section"\`, \`Heading\`, \`Prose\`, \`ButtonGroup\`, \`Button\`, \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/Site chrome/Cookie consent',
  component: CookieConsent.Root,
  argTypes: {
    defaultDecision: {
      control: 'inline-radio',
      options: [undefined, 'accepted', 'rejected'],
      description: 'Start answered.',
    },
    onDecision: { control: false, description: 'Called with the choice.' },
    className: { control: false, description: 'Joins `kv-cookie-consent`.' },
  },
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof CookieConsent.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Undecided: text, two equal buttons and the link to the Cookies page. */
export const Undecided: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <CookieConsent.Root>
        <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
        <CookieConsent.Text>
          We use statistics cookies to see which pages are read and to improve the website. Nothing
          is shared with others. Kvirnby municipality sets no cookies on this example website.
        </CookieConsent.Text>
        <CookieConsent.Actions>
          <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
          <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
        </CookieConsent.Actions>
        <CookieConsent.Accepted>
          You have accepted statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Accepted>
        <CookieConsent.Rejected>
          You have rejected statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Rejected>
        <CookieConsent.Link href="#cookies">
          Read more about cookies and change your choice
        </CookieConsent.Link>
      </CookieConsent.Root>
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
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
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Cookies on this website' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Accept statistics cookies' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Reject statistics cookies' })).toBeVisible()
    await expect(canvas.queryByRole('dialog')).toBeNull()
  },
}

/** Accepted: the region shows the result and the way to change it. */
export const Accepted: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <CookieConsent.Root defaultDecision="accepted">
        <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
        <CookieConsent.Text>
          We use statistics cookies to see which pages are read and to improve the website. Nothing
          is shared with others. Kvirnby municipality sets no cookies on this example website.
        </CookieConsent.Text>
        <CookieConsent.Actions>
          <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
          <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
        </CookieConsent.Actions>
        <CookieConsent.Accepted>
          You have accepted statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Accepted>
        <CookieConsent.Rejected>
          You have rejected statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Rejected>
        <CookieConsent.Link href="#cookies">
          Read more about cookies and change your choice
        </CookieConsent.Link>
      </CookieConsent.Root>
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
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
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/You have accepted statistics cookies/)).toBeVisible()
  },
}

/** Rejected: the same, for the other choice. */
export const Rejected: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <CookieConsent.Root defaultDecision="rejected">
        <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
        <CookieConsent.Text>
          We use statistics cookies to see which pages are read and to improve the website. Nothing
          is shared with others. Kvirnby municipality sets no cookies on this example website.
        </CookieConsent.Text>
        <CookieConsent.Actions>
          <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
          <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
        </CookieConsent.Actions>
        <CookieConsent.Accepted>
          You have accepted statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Accepted>
        <CookieConsent.Rejected>
          You have rejected statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Rejected>
        <CookieConsent.Link href="#cookies">
          Read more about cookies and change your choice
        </CookieConsent.Link>
      </CookieConsent.Root>
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
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
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/You have rejected statistics cookies/)).toBeVisible()
  },
}

/** Choosing moves focus to the result text, not to `body` (the story presses Reject). */
export const FocusAfterChoice: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <CookieConsent.Root>
        <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
        <CookieConsent.Text>
          We use statistics cookies to see which pages are read and to improve the website. Nothing
          is shared with others. Kvirnby municipality sets no cookies on this example website.
        </CookieConsent.Text>
        <CookieConsent.Actions>
          <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
          <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
        </CookieConsent.Actions>
        <CookieConsent.Accepted>
          You have accepted statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Accepted>
        <CookieConsent.Rejected>
          You have rejected statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Rejected>
        <CookieConsent.Link href="#cookies">
          Read more about cookies and change your choice
        </CookieConsent.Link>
      </CookieConsent.Root>
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
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
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Reject statistics cookies' }))
    await expect(canvas.getByText(/You have rejected statistics cookies/)).toHaveFocus()
  },
}

/** At 320px the buttons stack at full width and the text wraps. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <CookieConsent.Root>
        <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
        <CookieConsent.Text>
          We use statistics cookies to see which pages are read and to improve the website. Nothing
          is shared with others. Kvirnby municipality sets no cookies on this example website.
        </CookieConsent.Text>
        <CookieConsent.Actions>
          <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
          <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
        </CookieConsent.Actions>
        <CookieConsent.Accepted>
          You have accepted statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Accepted>
        <CookieConsent.Rejected>
          You have rejected statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Rejected>
        <CookieConsent.Link href="#cookies">
          Read more about cookies and change your choice
        </CookieConsent.Link>
      </CookieConsent.Root>
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
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
  ),
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Try the keys (see Keyboard above): Tab, then Enter or Space on a button. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <CookieConsent.Root>
        <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
        <CookieConsent.Text>
          We use statistics cookies to see which pages are read and to improve the website. Nothing
          is shared with others. Kvirnby municipality sets no cookies on this example website.
        </CookieConsent.Text>
        <CookieConsent.Actions>
          <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
          <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
        </CookieConsent.Actions>
        <CookieConsent.Accepted>
          You have accepted statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Accepted>
        <CookieConsent.Rejected>
          You have rejected statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Rejected>
        <CookieConsent.Link href="#cookies">
          Read more about cookies and change your choice
        </CookieConsent.Link>
      </CookieConsent.Root>
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
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
  ),
}

/** Right to left: the text and buttons start at the right; DOM order is unchanged. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <CookieConsent.Root>
        <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
        <CookieConsent.Text>
          We use statistics cookies to see which pages are read and to improve the website. Nothing
          is shared with others. Kvirnby municipality sets no cookies on this example website.
        </CookieConsent.Text>
        <CookieConsent.Actions>
          <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
          <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
        </CookieConsent.Actions>
        <CookieConsent.Accepted>
          You have accepted statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Accepted>
        <CookieConsent.Rejected>
          You have rejected statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Rejected>
        <CookieConsent.Link href="#cookies">
          Read more about cookies and change your choice
        </CookieConsent.Link>
      </CookieConsent.Root>
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
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
  ),
}

/** Forced colours: the region keeps its border and both buttons look alike. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <CookieConsent.Root>
        <CookieConsent.Heading>Cookies on this website</CookieConsent.Heading>
        <CookieConsent.Text>
          We use statistics cookies to see which pages are read and to improve the website. Nothing
          is shared with others. Kvirnby municipality sets no cookies on this example website.
        </CookieConsent.Text>
        <CookieConsent.Actions>
          <CookieConsent.Accept>Accept statistics cookies</CookieConsent.Accept>
          <CookieConsent.Reject>Reject statistics cookies</CookieConsent.Reject>
        </CookieConsent.Actions>
        <CookieConsent.Accepted>
          You have accepted statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Accepted>
        <CookieConsent.Rejected>
          You have rejected statistics cookies. You can change your choice on the Cookies page.
        </CookieConsent.Rejected>
        <CookieConsent.Link href="#cookies">
          Read more about cookies and change your choice
        </CookieConsent.Link>
      </CookieConsent.Root>
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
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
  ),
}
