import { Hero } from '@kvirn-ui/patterns'
import { kvirnbyHills } from '@kvirn-ui/patterns/fixtures'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/navigation-and-promotion/hero/hero.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Navigation and promotion/Hero (docs/design/storybook-patterns.md section 6). A
// composition of shipped parts: each story is the code an adopter copies.

const description = `The page's title and one next step, as a band: the \`h1\` at the \`display\` size, one sentence, one action and an optional decorative picture. No minimum height, no text over the picture, no carousel. The picture is last in the DOM: below the text until \`64rem\`, beside it from there.

Use it once, on a start page or a section start page. The title is the page's only \`h1\`. Write the parts in the order they are read.

## API

| Part | Element | What it does |
| ---- | ------- | ------------ |
| \`Hero.Root\` | \`<div>\` band (\`canvas\`, padding \`lg\`) with a \`Container\` | Holds the parts. Other \`<div>\` props |
| \`Hero.Heading\` | \`<h1>\` | The page's title, \`display\` size |
| \`Hero.Lead\` | \`<p>\` | One sentence, \`body-large\` |
| \`Hero.Action\` | \`<a href>\` | The one next step. \`service\` gives the service look with its arrow. \`as\` for a router link |
| \`Hero.Image\` | \`<img alt="">\` | Decorative by default. Pass \`alt\` only if it carries information |

Each part is also a flat export (\`HeroRoot\`, \`HeroHeading\`, …).

## Parts and gaps

Parts used: \`Section\`, \`Container\`, \`Heading\`, \`Link\` with \`Icon\`. No gap.
`

const meta = {
  title: 'Patterns/Navigation and promotion/Hero',
  component: Hero.Root,
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof Hero.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The start page at the desktop width: title, lead, one service action and the picture beside the text. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <Hero.Root>
      <Hero.Heading>Welcome to Kvirnby</Hero.Heading>
      <Hero.Lead>
        Find what you need from the municipality, from school to building permits.
      </Hero.Lead>
      <Hero.Action href="#permit" service>
        Apply for a building permit
      </Hero.Action>
      <Hero.Image src={kvirnbyHills} />
    </Hero.Root>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Welcome to Kvirnby' }),
    ).toBeVisible()
    await expect(canvasElement.querySelectorAll('h1')).toHaveLength(1)
    await expect(canvasElement.querySelector('img')).toHaveAttribute('alt', '')
    await expect(canvasElement.querySelectorAll('a')).toHaveLength(1)
  },
}

/** 320px: one column, the picture under the action, nothing scrolls sideways. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible()
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** No picture: the text takes the band's width. */
export const WithoutImage: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <Hero.Root>
      <Hero.Heading>Building and environment</Hero.Heading>
      <Hero.Lead>Everything about building permits, waste and water in one place.</Hero.Lead>
      <Hero.Action href="#permit">See how to apply for a building permit</Hero.Action>
    </Hero.Root>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('img')).toHaveLength(0)
  },
}

/** No action: a title and a lead, and no link. */
export const WithoutAction: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <Hero.Root>
      <Hero.Heading>About Kvirnby municipality</Hero.Heading>
      <Hero.Lead>The municipality has four thousand residents and a long coast.</Hero.Lead>
      <Hero.Image src={kvirnbyHills} />
    </Hero.Root>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('a')).toHaveLength(0)
  },
}

/** A long compound word at 320px: the title hyphenates or wraps and nothing scrolls sideways. */
export const LongWordTitle: Story = {
  globals: { locale: 'en', ...narrowGlobals },
  render: () => (
    <div lang="en">
      <Hero.Root>
        <Hero.Heading>Intergovernmentalisation notification acknowledgements</Hero.Heading>
        <Hero.Lead>Here you find everything you need from the municipality.</Hero.Lead>
        <Hero.Action href="#apply" service>
          Apply for housing benefit
        </Hero.Action>
        <Hero.Image src={kvirnbyHills} />
      </Hero.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Try the keys (see Keyboard above): Tab reaches the one action; the title and the picture are not stops. */
export const Keyboard: Story = { ...Default }

/** Right to left: the picture is on the left, the text starts at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => (
    <div lang="en">
      <Hero.Root>
        <Hero.Heading>Welcome to Kvirnby</Hero.Heading>
        <Hero.Lead>
          Find what you need from the municipality, from school to building permits.
        </Hero.Lead>
        <Hero.Action href="#permit" service>
          Apply for a building permit
        </Hero.Action>
        <Hero.Image src={kvirnbyHills} />
      </Hero.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Welcome to Kvirnby' }),
    ).toBeVisible()
  },
}

/** Forced colours: the action keeps its outline in `LinkText`, the title is `CanvasText`. */
export const ForcedColors: Story = {
  ...Default,
  globals: { forcedColors: 'active', ...wideGlobals },
}
