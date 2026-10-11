import { SiteHeader, TopBar } from '@kvirn-ui/patterns'
import { Link, Navigation } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/top-bar/top-bar.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Site chrome/Top bar: a slim bar of two sides, first in the Site header. Each story is
// the code an adopter copies: literal JSX, literal text.

const description = `A slim bar with two sides: its children sit at the start and at the end, in DOM order, and wrap when there is no room. Write a line of text first and a \`Navigation\` last.

Put it first in the Site header, or full width at the top of a page. With no \`variant\` it has no fill; \`primary\`, \`secondary\` and \`accent\` fill it, with the on-colour for its text, links, focus ring and current item. Inside the header on the primary Site header it is the darker top band, and its links and focus ring turn \`on-primary\`.

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`TopBar.Root\` | \`<div>\` | The \`<div>\` props. \`variant\`: none (default, no fill), \`primary\`, \`secondary\` or \`accent\`, a fill with its on-colour. Children: your text, then your \`Navigation\` |

The pattern has no strings of its own. The part is also a flat export (\`TopBarRoot\`).

## Parts and gaps

Parts used: none; you write \`Navigation\` and \`Link\` inside it. No gap.
`

const meta = {
  title: 'Patterns/Site chrome/Top bar',
  component: TopBar.Root,
  globals: { locale: 'en' },
  argTypes: {
    variant: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'accent'],
      description: 'Default: none, no fill. `kv-top-bar--<variant>`: a fill with its on-colour.',
    },
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof TopBar.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Text at the start, the tools at the end. */
export const Default: Story = {
  render: () => (
    <TopBar.Root>
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
    </TopBar.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Tools' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  },
}

/** `variant="primary"`: the `primary` fill, `on-primary` text, links, ring and current bar. */
export const Primary: Story = {
  globals: { ...wideGlobals },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <TopBar.Root variant="primary">
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
    </TopBar.Root>
  ),
}

/** `variant="secondary"`: the `secondary` fill with `on-secondary`. */
export const Secondary: Story = {
  globals: { ...wideGlobals },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <TopBar.Root variant="secondary">
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
    </TopBar.Root>
  ),
}

/** `variant="accent"`: the `accent` fill with `on-accent`. */
export const Accent: Story = {
  globals: { ...wideGlobals },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <TopBar.Root variant="accent">
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
    </TopBar.Root>
  ),
}

/** The accent bar right to left: the text is at the right, the navigation at the left. */
export const AccentRTL: Story = {
  ...Accent,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** The accent bar in forced colours: the fill drops to Canvas with a CanvasText edge. */
export const AccentForcedColors: Story = {
  ...Accent,
  globals: { forcedColors: 'active', ...wideGlobals },
}

/** At 320px the two sides wrap onto their own rows; nothing is hidden or scrolls sideways. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <TopBar.Root>
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
    </TopBar.Root>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('link', { name: 'GitHub' })).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** On the primary Site header: the darker band, `on-primary` links, the current tool's bar. */
export const OnPrimaryBand: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <SiteHeader.Root variant="primary">
      <TopBar.Root>
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
      </TopBar.Root>
    </SiteHeader.Root>
  ),
}

/** Try the keys (see Keyboard above): Tab moves through the links in DOM order. */
export const Keyboard: Story = {
  render: () => (
    <TopBar.Root>
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
        </Navigation.List>
      </Navigation.Root>
    </TopBar.Root>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Latest: Pre-alpha' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Documentation' })).toHaveFocus()
  },
}

/** Right to left: the text is at the right and the navigation at the left. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the links are `LinkText`, the current tool keeps its bar. */
export const ForcedColors: Story = {
  ...Default,
  globals: { forcedColors: 'active' },
}
