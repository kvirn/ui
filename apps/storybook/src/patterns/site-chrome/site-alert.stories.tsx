import { en } from '@kvirn-ui/i18n/en'
import {
  ApplicationLogo,
  LanguageLinks,
  MainMenu,
  PageFrame,
  SiteAlert,
  SiteHeader,
  SiteSearch,
} from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import { KvirnProvider } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/site-alert/site-alert.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import {
  PlaceholderFooter,
  chromeViewports,
  narrowGlobals,
  wideGlobals,
} from '../patterns-story-support.tsx'

// Patterns/Site chrome/Site alert (docs/design/storybook-patterns.md section 5.5). Each story is
// the code an adopter copies: literal JSX, literal text.

const description = `A notice for the whole site: a water shut-off, a closed service, a disruption. It is a named region after the banner and before the breadcrumb and \`main\`, so landmark navigation finds it. One at most.

It is never announced on load and never takes focus: the status word, the shape and the title carry the message, and it is read in order. The title is a \`<p>\`, because the page has no heading before its \`h1\`. Write \`SiteAlert.Close\` to make it dismissible: focus then moves to \`main\` (the skip target), never to \`body\`. Remembering the dismissal for the session is the site's (\`onDismiss\`).

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`SiteAlert.Root\` | \`<section>\`, named by its title | \`tone\`: \`warning\` (default) or \`info\`, exposed as \`data-tone\`. \`onDismiss\`. \`mainId\`: the element that gets focus on dismiss, default \`main\`. \`messages\`: the status words and \`close\`, which \`Alert\` owns |
| \`SiteAlert.Title\` | \`<p>\` | The headline, one line. Wrap another language in \`lang\` |
| \`SiteAlert.Body\` | \`<div>\` | The details: a sentence or two |
| \`SiteAlert.Link\` | \`<a href>\` in the alert's actions | \`href\`, \`as\`. The one link to more information |
| \`SiteAlert.Close\` | \`<button>\` named by \`Alert.Close\` | Removes the alert, calls \`onDismiss\`, moves focus to \`main\`. Put it last |

Each part is also a flat export (\`SiteAlertRoot\`, \`SiteAlertTitle\`, …).

## Parts and gaps

Parts used: \`Alert.Warning\` / \`Alert.Info\` as a \`section\`, \`Alert.Title\`, \`Alert.Body\`, \`Alert.Actions\`, \`Alert.Close\`, \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/Site chrome/Site alert',
  component: SiteAlert.Root,
  argTypes: {
    tone: { control: 'inline-radio', options: ['warning', 'info'], description: 'The status.' },
    onDismiss: { control: false, description: 'Called when the alert is dismissed.' },
    mainId: { control: 'text', description: 'The id of `main`, where focus goes on dismiss.' },
    messages: { control: false, description: 'Per-instance message overrides.' },
    className: { control: false, description: 'Joins `kv-site-alert`.' },
  },
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof SiteAlert.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: a warning between the banner and `main`, named by its title. */
export const Default: Story = {
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
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
        </SiteAlert.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    const region = canvas.getByRole('region', { name: /Water shut off/ })
    await expect(region).toBeVisible()
    await expect(region.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull()
  },
}

/** `tone="info"`: news people may want, with its own status word and shape. */
export const Info: Story = {
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
        <SiteAlert.Root tone="info">
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
        </SiteAlert.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Information:')).toBeInTheDocument()
  },
}

/** With `SiteAlert.Close`. Closing removes the alert and moves focus to `main`, not `body`. */
export const Dismissible: Story = {
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
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
          <SiteAlert.Close />
        </SiteAlert.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
}

/** Dismissed: the alert is gone for the session, and focus is on `main` (the story clicks Close). */
export const Dismissed: Story = {
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
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
          <SiteAlert.Close />
        </SiteAlert.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Close message' }))
    await expect(canvas.queryByRole('region', { name: /Water shut off/ })).toBeNull()
    await expect(canvas.getByRole('main')).toHaveFocus()
  },
}

/** A long title wraps and hyphenates; nothing is clipped. */
export const LongTitle: Story = {
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
        <SiteAlert.Root>
          <SiteAlert.Title>
            Water shut off in North Kvirnby and the neighbouring districts on Wednesday 14 October
            because of planned work on the water main, so please fill containers in advance
          </SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
          <SiteAlert.Close />
        </SiteAlert.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: /planned work/ })).toBeVisible()
  },
}

/** At 320px the title and details wrap and the close button stays reachable. */
export const Narrow: Story = {
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
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
          <SiteAlert.Close />
        </SiteAlert.Root>
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

/** Try the keys (see Keyboard above): Tab reaches the link and Close; Enter on Close moves focus to `main`. */
export const Keyboard: Story = {
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
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
          <SiteAlert.Close />
        </SiteAlert.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
}

/** Right to left: the bar and the close button move to the other edge; DOM order is unchanged. */
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
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
          <SiteAlert.Close />
        </SiteAlert.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
}

/** Forced colours: the alert keeps its border; the word and shape carry the status. */
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
        <SiteAlert.Root>
          <SiteAlert.Title>Water shut off in North Kvirnby on Wednesday 14 October</SiteAlert.Title>
          <SiteAlert.Body>
            The water is off from 9 to 15 because of work on the water main. Fill containers in
            advance if you can.
          </SiteAlert.Body>
          <SiteAlert.Link href="#water-shut-off">Read more about the water shut-off</SiteAlert.Link>
          <SiteAlert.Close />
        </SiteAlert.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
          <p>Find information and services from Kvirnby municipality.</p>
        </PageFrame.Main>
        <PlaceholderFooter />
      </PageFrame.Root>
    </KvirnProvider>
  ),
}
