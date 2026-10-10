import { en } from '@kvirn-ui/i18n/en'
import { MainMenu, PageFrame, PageTools, SiteHeader } from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import { Button, Field, KvirnProvider, TextInput } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef } from 'react'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/page-tools/page-tools.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import {
  PlaceholderFooter,
  chromeViewports,
  narrowGlobals,
  wideGlobals,
} from '../patterns-story-support.tsx'

// Patterns/Site chrome/Page tools (docs/design/storybook-patterns.md section 5.7). Each story is
// the code an adopter copies: literal JSX, literal text. The `useRef` is the one thing a page of
// your own needs besides the parts: `PageTools.Top` reads the element it points at.

const description = `Two rows around a content page. **Top:** read aloud under the \`h1\`, for the lead and the prose. **End of \`main\`:** the last-updated line you write (a \`<p>\` with a \`<time datetime>\`), a button that copies the page's link with its status beside it, and a Print button.

There are no third-party share links: nothing leaves the page. Print calls \`window.print()\`; print styles are a 1.0 item, so the printed page is the browser's default for now. Copy link's name never changes; the result is announced by CopyButton. Each tool is on its own line at 320px and one row from 40rem.

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`PageTools.Top\` | ReadAloud's named group | \`contentRef\`: the element whose text is read. Children replace the default controls |
| \`PageTools.Root\` | \`<div>\` | The \`<div>\` props |
| \`PageTools.CopyLink\` | \`<button>\` and its status | \`text\`: the address, or a function. Default: the page's own. Its label is its children, and the status words are \`CopyButton\`'s |
| \`PageTools.Print\` | \`<button>\` | \`onPrint\` replaces \`window.print()\`. Its text is its children |

The last-updated line is your own \`<p>\` with a \`<time datetime>\`: the pattern holds no text. Each part is also a flat export (\`PageToolsRoot\`, \`PageToolsCopyLink\`, …).

## Parts and gaps

Parts used: \`ReadAloud\`, \`CopyButton\`, \`Button\`. No gap. Read aloud is blocked in its own plan (0088): the row is shown as it will be.
`

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

const meta = {
  title: 'Patterns/Site chrome/Page tools',
  component: PageTools.Root,
  argTypes: {
    className: { control: false, description: 'Joins `kv-page-tools`.' },
  },
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageTools.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The main example: read aloud under the `h1`, and the row at the end of `main`. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <KvirnProvider locale="en" messages={en}>
        <PageFrame.Root>
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
            <h1>Preschool</h1>
            <PageTools.Top contentRef={contentRef} />
            <div ref={contentRef}>
              <p>
                Find information about preschool in Kvirnby municipality and how to apply for a
                place.
              </p>
              <p>You can apply four months before the start date you want, at the earliest.</p>
            </div>
            <PageTools.Root>
              <p className="kv-page-tools-updated">
                Last updated: <time dateTime="2026-10-02">2 October 2026</time>
              </p>
              <PageTools.CopyLink text="https://kvirnby.example/preschool">
                Copy link
              </PageTools.CopyLink>
              <PageTools.Print onPrint={() => {}}>Print</PageTools.Print>
            </PageTools.Root>
          </PageFrame.Main>
          <PlaceholderFooter />
        </PageFrame.Root>
      </KvirnProvider>
    )
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Copy link' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Print' })).toBeVisible()
    await expect(canvasElement.querySelector('time')).toHaveAttribute('datetime', '2026-10-02')
  },
}

/** Copy succeeded: the status appears beside the button and the button keeps its name. */
export const CopySuccess: Story = {
  globals: { ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <KvirnProvider locale="en" messages={en}>
        <PageFrame.Root>
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
            <h1>Preschool</h1>
            <PageTools.Top contentRef={contentRef} />
            <div ref={contentRef}>
              <p>
                Find information about preschool in Kvirnby municipality and how to apply for a
                place.
              </p>
              <p>You can apply four months before the start date you want, at the earliest.</p>
            </div>
            <PageTools.Root>
              <p className="kv-page-tools-updated">
                Last updated: <time dateTime="2026-10-02">2 October 2026</time>
              </p>
              <PageTools.CopyLink text="https://kvirnby.example/preschool">
                Copy link
              </PageTools.CopyLink>
              <PageTools.Print onPrint={() => {}}>Print</PageTools.Print>
            </PageTools.Root>
          </PageFrame.Main>
          <PlaceholderFooter />
        </PageFrame.Root>
      </KvirnProvider>
    )
  },
  play: async ({ canvas }) => {
    stubClipboard(async () => {})
    await userEvent.click(canvas.getByRole('button', { name: 'Copy link' }))
    await expect(canvas.getByText('Copied', { exact: false })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Copy link' })).toBeVisible()
    Reflect.deleteProperty(navigator, 'clipboard')
  },
}

/** Copy failed: the browser refused, so the status says so and the user copies by hand. */
export const CopyFailure: Story = {
  globals: { ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <KvirnProvider locale="en" messages={en}>
        <PageFrame.Root>
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
            <h1>Preschool</h1>
            <PageTools.Top contentRef={contentRef} />
            <div ref={contentRef}>
              <p>
                Find information about preschool in Kvirnby municipality and how to apply for a
                place.
              </p>
              <p>You can apply four months before the start date you want, at the earliest.</p>
            </div>
            <PageTools.Root>
              <p className="kv-page-tools-updated">
                Last updated: <time dateTime="2026-10-02">2 October 2026</time>
              </p>
              <PageTools.CopyLink text="https://kvirnby.example/preschool">
                Copy link
              </PageTools.CopyLink>
              <PageTools.Print onPrint={() => {}}>Print</PageTools.Print>
            </PageTools.Root>
          </PageFrame.Main>
          <PlaceholderFooter />
        </PageFrame.Root>
      </KvirnProvider>
    )
  },
  play: async ({ canvas }) => {
    stubClipboard(async () => {
      throw new Error('denied')
    })
    await userEvent.click(canvas.getByRole('button', { name: 'Copy link' }))
    await expect(canvas.getByText('Could not copy', { exact: false })).toBeVisible()
    Reflect.deleteProperty(navigator, 'clipboard')
  },
}

/** At 320px each tool is on its own line and nothing scrolls sideways. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <KvirnProvider locale="en" messages={en}>
        <PageFrame.Root>
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
            <h1>Preschool</h1>
            <PageTools.Top contentRef={contentRef} />
            <div ref={contentRef}>
              <p>
                Find information about preschool in Kvirnby municipality and how to apply for a
                place.
              </p>
              <p>You can apply four months before the start date you want, at the earliest.</p>
            </div>
            <PageTools.Root>
              <p className="kv-page-tools-updated">
                Last updated: <time dateTime="2026-10-02">2 October 2026</time>
              </p>
              <PageTools.CopyLink text="https://kvirnby.example/preschool">
                Copy link
              </PageTools.CopyLink>
              <PageTools.Print onPrint={() => {}}>Print</PageTools.Print>
            </PageTools.Root>
          </PageFrame.Main>
          <PlaceholderFooter />
        </PageFrame.Root>
      </KvirnProvider>
    )
  },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Try the keys (see Keyboard above): Tab moves from Copy link to Print. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <KvirnProvider locale="en" messages={en}>
        <PageFrame.Root>
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
            <h1>Preschool</h1>
            <PageTools.Top contentRef={contentRef} />
            <div ref={contentRef}>
              <p>
                Find information about preschool in Kvirnby municipality and how to apply for a
                place.
              </p>
              <p>You can apply four months before the start date you want, at the earliest.</p>
            </div>
            <PageTools.Root>
              <p className="kv-page-tools-updated">
                Last updated: <time dateTime="2026-10-02">2 October 2026</time>
              </p>
              <PageTools.CopyLink text="https://kvirnby.example/preschool">
                Copy link
              </PageTools.CopyLink>
              <PageTools.Print onPrint={() => {}}>Print</PageTools.Print>
            </PageTools.Root>
          </PageFrame.Main>
          <PlaceholderFooter />
        </PageFrame.Root>
      </KvirnProvider>
    )
  },
}

/** Right to left: the row starts at the right; DOM order is unchanged. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <KvirnProvider locale="en" messages={en}>
        <PageFrame.Root>
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
            <h1>Preschool</h1>
            <PageTools.Top contentRef={contentRef} />
            <div ref={contentRef}>
              <p>
                Find information about preschool in Kvirnby municipality and how to apply for a
                place.
              </p>
              <p>You can apply four months before the start date you want, at the earliest.</p>
            </div>
            <PageTools.Root>
              <p className="kv-page-tools-updated">
                Last updated: <time dateTime="2026-10-02">2 October 2026</time>
              </p>
              <PageTools.CopyLink text="https://kvirnby.example/preschool">
                Copy link
              </PageTools.CopyLink>
              <PageTools.Print onPrint={() => {}}>Print</PageTools.Print>
            </PageTools.Root>
          </PageFrame.Main>
          <PlaceholderFooter />
        </PageFrame.Root>
      </KvirnProvider>
    )
  },
}

/** Forced colours: buttons keep their border. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <KvirnProvider locale="en" messages={en}>
        <PageFrame.Root>
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
            <h1>Preschool</h1>
            <PageTools.Top contentRef={contentRef} />
            <div ref={contentRef}>
              <p>
                Find information about preschool in Kvirnby municipality and how to apply for a
                place.
              </p>
              <p>You can apply four months before the start date you want, at the earliest.</p>
            </div>
            <PageTools.Root>
              <p className="kv-page-tools-updated">
                Last updated: <time dateTime="2026-10-02">2 October 2026</time>
              </p>
              <PageTools.CopyLink text="https://kvirnby.example/preschool">
                Copy link
              </PageTools.CopyLink>
              <PageTools.Print onPrint={() => {}}>Print</PageTools.Print>
            </PageTools.Root>
          </PageFrame.Main>
          <PlaceholderFooter />
        </PageFrame.Root>
      </KvirnProvider>
    )
  },
}
