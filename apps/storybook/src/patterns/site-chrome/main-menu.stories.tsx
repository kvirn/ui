import { MainMenu, PageFrame, SiteHeader } from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/main-menu/main-menu.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import {
  PlaceholderFooter,
  chromeViewports,
  expectDrawn,
  narrowGlobals,
  wideGlobals,
} from '../patterns-story-support.tsx'

// Patterns/Site chrome/Main menu: the main navigation as the APG Disclosure Navigation pattern
// (docs/design/storybook-patterns.md section 5.2), exported as `MainMenu`. Shown inside the Site
// header, because the open panel is positioned against it.

const description = `The main navigation where every topic has sub-pages: each topic is a **button** that opens a list of links, starting with the topic's own page. It is the APG Disclosure Navigation pattern built from \`Navigation\` and \`Disclosure\`, never \`role="menu"\`: the items are page links, and there are no arrow keys.

It opens and closes on activation only: no hover-open, no focus-open and no delay. From \`64rem\` an open panel is a full-width band under the header that overlays the page; below \`64rem\` the panels open in flow under their button, inside the Menu. The keys are in the Keyboard section below.

Use it on a site with more than a handful of topics. For a short list of top-level pages write only \`MainMenu.Link\`s. A topic is the part you choose: \`MainMenu.Link\` for a page, \`MainMenu.Topic\` for a page with sub-pages.

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`MainMenu.Root\` | \`<nav>\` | \`label\` (required): its name. Owns which topic is open, Escape and the focus-out close |
| \`MainMenu.Link\` | \`<li>\` with \`<a href>\` | \`href\`, \`current\` (\`page\`, or \`true\` on the deepest item shown), \`as\` |
| \`MainMenu.Topic\` | \`<li>\` | Owns the open state of its button and panel |
| \`MainMenu.TopicButton\` | \`<button>\` with a chevron | Text that says what the panel holds. \`data-trail\` while the page is inside |
| \`MainMenu.TopicPanel\` | \`<div>\`, \`hidden\` while closed, with a list | Start it with \`MainMenu.Overview\` |
| \`MainMenu.Overview\` | \`<li>\` with \`<a href>\` | As \`MainMenu.Link\`: the topic's own page |

The pattern has no strings of its own. A \`current\` link in a closed panel is never exposed as current: one \`aria-current\` per navigation. Each part is also a flat export (\`MainMenuRoot\`, \`MainMenuTopic\`, …).

## Parts and gaps

Parts used: \`Navigation\`, \`Disclosure\`, \`Link\`. Gap: the library plans no NavigationMenu component ("not planned", roadmap), so this stays a composition in \`@kvirn-ui/patterns\`.
`

const meta = {
  title: 'Patterns/Site chrome/Main menu',
  component: MainMenu.Root,
  args: { label: 'Main menu' },
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof MainMenu.Root>

export default meta
type Story = StoryObj<typeof meta>

const firstTopic = { name: 'Living and environment', hidden: true } as const
const secondTopic = { name: 'Care and support', hidden: true } as const

/** The main menu at the desktop width: topics are buttons in the nav row, every panel closed. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
        </SiteHeader.Topbar>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label="Main menu">
              <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
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
  play: async ({ canvas, canvasElement }) => {
    const topic = canvas.getByRole('button', firstTopic)
    await expect(topic).toHaveAttribute('aria-expanded', 'false')
    await expect(topic).toHaveAttribute('aria-controls')
    await expect(canvasElement.querySelector('[role="menu"], [aria-haspopup]')).toBeNull()
  },
}

/** An open panel from 64rem: a band under the header with the overview link first, then the children. */
export const OpenWide: Story = {
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
        </SiteHeader.Topbar>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label="Main menu">
              <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
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
    await userEvent.click(canvas.getByRole('button', firstTopic))
    await expectDrawn(
      canvas.getByRole('link', { name: 'All about living and environment', hidden: true }),
    )
    // One panel at a time: opening another closes the first.
    await userEvent.click(canvas.getByRole('button', secondTopic))
    await expect(canvas.getByRole('button', firstTopic)).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.getByRole('button', secondTopic)).toHaveAttribute('aria-expanded', 'true')
  },
}

/** Below 64rem the topics are rows in the Menu, and panels open in flow and are independent. */
export const NarrowMenu: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
        </SiteHeader.Topbar>
        <SiteHeader.Menu defaultOpen>
          <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label="Main menu">
              <MainMenu.Topic>
                <MainMenu.TopicButton>Living and environment</MainMenu.TopicButton>
                <MainMenu.TopicPanel>
                  <MainMenu.Overview href="#living">
                    All about living and environment
                  </MainMenu.Overview>
                  <MainMenu.Link href="#waste">Waste and recycling</MainMenu.Link>
                  <MainMenu.Link href="#building">Building permits</MainMenu.Link>
                </MainMenu.TopicPanel>
              </MainMenu.Topic>
              <MainMenu.Topic>
                <MainMenu.TopicButton>Care and support</MainMenu.TopicButton>
                <MainMenu.TopicPanel>
                  <MainMenu.Overview href="#care">All about care and support</MainMenu.Overview>
                  <MainMenu.Link href="#elderly">Elderly care</MainMenu.Link>
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
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', firstTopic))
    await userEvent.click(canvas.getByRole('button', secondTopic))
    await expect(canvas.getByRole('button', firstTopic)).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('button', secondTopic)).toHaveAttribute('aria-expanded', 'true')
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/**
 * The page is a child of the first topic: the topic's button has the trail look and, while its
 * panel is shown, the page's link has `aria-current="page"`. A link in a closed panel never does.
 */
export const CurrentPage: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
        </SiteHeader.Topbar>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label="Main menu">
              <MainMenu.Topic>
                <MainMenu.TopicButton>Living and environment</MainMenu.TopicButton>
                <MainMenu.TopicPanel>
                  <MainMenu.Overview href="#living">
                    All about living and environment
                  </MainMenu.Overview>
                  <MainMenu.Link href="#waste" current="page">
                    Waste and recycling
                  </MainMenu.Link>
                  <MainMenu.Link href="#building">Building permits</MainMenu.Link>
                </MainMenu.TopicPanel>
              </MainMenu.Topic>
              <MainMenu.Topic>
                <MainMenu.TopicButton>Care and support</MainMenu.TopicButton>
                <MainMenu.TopicPanel>
                  <MainMenu.Overview href="#care">All about care and support</MainMenu.Overview>
                  <MainMenu.Link href="#elderly">Elderly care</MainMenu.Link>
                </MainMenu.TopicPanel>
              </MainMenu.Topic>
            </MainMenu.Root>
          </SiteHeader.MenuPanel>
        </SiteHeader.Menu>
      </SiteHeader.Root>
      <PageFrame.Main>
        <h1>Waste and recycling</h1>
      </PageFrame.Main>
      <PlaceholderFooter />
    </PageFrame.Root>
  ),
  play: async ({ canvas, canvasElement }) => {
    const nav = canvasElement.querySelector('.kv-mega-menu')
    await expect(nav?.querySelectorAll('[aria-current]')).toHaveLength(0)
    await expect(canvas.getByRole('button', firstTopic)).toHaveAttribute('data-trail')
    await userEvent.click(canvas.getByRole('button', firstTopic))
    await expect(nav?.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  },
}

/** Try the keys listed in the Keyboard section above. */
export const Keyboard: Story = {
  render: () => (
    <PageFrame.Root locale="en">
      <SiteHeader.Root>
        <SiteHeader.Topbar>
          <SiteHeader.Brand href="#start">
            <SiteHeader.Logo src={kvirnbyMark} />
            Kvirnby municipality
          </SiteHeader.Brand>
        </SiteHeader.Topbar>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label="Main menu">
              <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
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
    const topic = canvas.getByRole('button', firstTopic)
    topic.focus()
    await userEvent.keyboard('{Enter}')
    await expect(topic).toHaveAttribute('aria-expanded', 'true')
    await expect(topic).toHaveFocus()
    await userEvent.tab()
    await expect(document.activeElement).toHaveTextContent('All about living and environment')
    await userEvent.keyboard('{Escape}')
    await expect(topic).toHaveAttribute('aria-expanded', 'false')
    await expect(topic).toHaveFocus()
  },
}

/** Right to left: the row starts at the right, and the chevrons stay vertical. */
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
        </SiteHeader.Topbar>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label="Main menu">
              <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
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
    await userEvent.click(canvas.getByRole('button', firstTopic))
  },
}

/** Forced colours: the open panel keeps a `CanvasText` border where the shadow drops. */
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
        </SiteHeader.Topbar>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label="Main menu">
              <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
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
    await userEvent.click(canvas.getByRole('button', firstTopic))
  },
}
