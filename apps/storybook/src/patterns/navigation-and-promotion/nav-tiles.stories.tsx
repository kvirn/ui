import { NavTiles } from '@kvirn-ui/patterns'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/navigation-and-promotion/nav-tiles/nav-tiles.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Navigation and promotion/Nav tiles (docs/design/storybook-patterns.md section 6).

const description = `A list of tiles to choose a sub-topic from: each a heading that holds the one link, and one sentence. The card is not clickable: the link is in the heading, so a screen reader meets one link per tile and the heading outline lists the topics. One column at 320px, two from \`40rem\`, three from \`64rem\`.

Set \`level\` to the page's outline: \`h2\` on a subpage, \`h3\` under a "Municipal services" \`h2\` on the start page.

## API

| Part | Element | What it does |
| ---- | ------- | ------------ |
| \`NavTiles.Root\` | \`<ul>\` | Columns. Holds the tiles |
| \`NavTiles.Tile\` | \`<li>\` card | Holds a heading and a text. Not clickable |
| \`NavTiles.Heading\` | \`<h2>\` holding an \`<a href>\` | \`level\` (\`h2\` default, or \`h3\`), \`href\`, \`as\` (a router link). The text is the link's name |
| \`NavTiles.Text\` | \`<p>\` | One sentence |

## Parts and gaps

Parts used: \`Columns as="ul"\`, \`Card\`, \`Heading\`, \`Link\`, \`Prose\`. No gap.
`

const meta = {
  title: 'Patterns/Navigation and promotion/Nav tiles',
  component: NavTiles.Root,
  globals: { locale: 'en' },
  parameters: {
    layout: 'padded',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof NavTiles.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Three tiles on a subpage: one link each, in the `h2`. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <NavTiles.Root>
      <NavTiles.Tile>
        <NavTiles.Heading href="#children">Children and education</NavTiles.Heading>
        <NavTiles.Text>
          Preschool, school and after-school care for children and young people.
        </NavTiles.Text>
      </NavTiles.Tile>
      <NavTiles.Tile>
        <NavTiles.Heading href="#building">Building and environment</NavTiles.Heading>
        <NavTiles.Text>Building permits, waste, water and sewage.</NavTiles.Text>
      </NavTiles.Tile>
      <NavTiles.Tile>
        <NavTiles.Heading href="#care">Support and care</NavTiles.Heading>
        <NavTiles.Text>
          Home care, elderly care and support for people with disabilities.
        </NavTiles.Text>
      </NavTiles.Tile>
    </NavTiles.Root>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(3)
    await expect(canvas.getAllByRole('link')).toHaveLength(3)
    for (const tile of canvasElement.querySelectorAll('li')) {
      await expect(tile.querySelectorAll('a')).toHaveLength(1)
    }
  },
}

/** Seven tiles: a ragged last row, the same order in DOM and on screen. */
export const SevenTiles: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <NavTiles.Root>
      <NavTiles.Tile>
        <NavTiles.Heading href="#children">Children and education</NavTiles.Heading>
        <NavTiles.Text>Preschool, school and after-school care.</NavTiles.Text>
      </NavTiles.Tile>
      <NavTiles.Tile>
        <NavTiles.Heading href="#building">Building and environment</NavTiles.Heading>
        <NavTiles.Text>Building permits, waste and water.</NavTiles.Text>
      </NavTiles.Tile>
      <NavTiles.Tile>
        <NavTiles.Heading href="#care">Support and care</NavTiles.Heading>
        <NavTiles.Text>Home care and elderly care.</NavTiles.Text>
      </NavTiles.Tile>
      <NavTiles.Tile>
        <NavTiles.Heading href="#traffic">Traffic and travel</NavTiles.Heading>
        <NavTiles.Text>Parking, streets and public transport.</NavTiles.Text>
      </NavTiles.Tile>
      <NavTiles.Tile>
        <NavTiles.Heading href="#culture">Culture and leisure</NavTiles.Heading>
        <NavTiles.Text>Libraries, swimming halls and associations.</NavTiles.Text>
      </NavTiles.Tile>
      <NavTiles.Tile>
        <NavTiles.Heading href="#business">Business and work</NavTiles.Heading>
        <NavTiles.Text>Start a business and find work.</NavTiles.Text>
      </NavTiles.Tile>
      <NavTiles.Tile>
        <NavTiles.Heading href="#democracy">Politics and democracy</NavTiles.Heading>
        <NavTiles.Text>Committees, meetings and decisions.</NavTiles.Text>
      </NavTiles.Tile>
    </NavTiles.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(7)
  },
}

/** 320px: one column, nothing scrolls sideways. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** A long compound word in a heading at 320px wraps inside the tile. */
export const LongWordHeading: Story = {
  globals: { locale: 'en', ...narrowGlobals },
  render: () => (
    <div lang="en">
      <NavTiles.Root>
        <NavTiles.Tile>
          <NavTiles.Heading href="#fees">
            Intergovernmentalisation fee application acknowledgements
          </NavTiles.Heading>
          <NavTiles.Text>Apply for or change a fee.</NavTiles.Text>
        </NavTiles.Tile>
      </NavTiles.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** On the start page the tiles sit under a section `h2`, so each tile heading is an `h3`. */
export const UnderSectionHeading: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <section aria-labelledby="service">
      <h2 id="service">Municipal services</h2>
      <NavTiles.Root>
        <NavTiles.Tile>
          <NavTiles.Heading level="h3" href="#children">
            Children and education
          </NavTiles.Heading>
          <NavTiles.Text>Preschool, school and after-school care.</NavTiles.Text>
        </NavTiles.Tile>
        <NavTiles.Tile>
          <NavTiles.Heading level="h3" href="#building">
            Building and environment
          </NavTiles.Heading>
          <NavTiles.Text>Building permits, waste and water.</NavTiles.Text>
        </NavTiles.Tile>
      </NavTiles.Root>
    </section>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  },
}

/** Try the keys (see Keyboard above): Tab moves through the tiles' links in order. */
export const Keyboard: Story = { ...Default }

/** Right to left: the tiles start at the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => (
    <div lang="en">
      <NavTiles.Root>
        <NavTiles.Tile>
          <NavTiles.Heading href="#children">Children and education</NavTiles.Heading>
          <NavTiles.Text>Preschool, school and after-school care.</NavTiles.Text>
        </NavTiles.Tile>
        <NavTiles.Tile>
          <NavTiles.Heading href="#building">Building and environment</NavTiles.Heading>
          <NavTiles.Text>Permits, waste and water.</NavTiles.Text>
        </NavTiles.Tile>
      </NavTiles.Root>
    </div>
  ),
}

/** Forced colours: each tile keeps its `CanvasText` border and the link is `LinkText`. */
export const ForcedColors: Story = {
  ...Default,
  globals: { forcedColors: 'active', ...wideGlobals },
}
