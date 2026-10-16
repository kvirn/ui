import { Card, Heading, Stack } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/stack/stack.a11y.md?raw'
import guide from '../../../../../packages/react/src/stack/stack.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/Stack: the headless Stack, styled by @kvirn-ui/theme/theme.css (DESIGN.md, Layout).

const description = usageGuide(guide)

const meta = {
  title: 'Components/Layout/Stack',
  component: Stack,
  args: {
    children: (
      <>
        {/* kv-lang-ok: a long Finnish word, a hard case for wrapping */}
        <Heading as="h2">Waste collection</Heading>
        <Card.Root>
          {/* kv-lang-ok: a long Finnish word, a hard case for wrapping */}
          <Card.Body>The next collection is on Tuesday.</Card.Body>
        </Card.Root>
        <Card.Root>
          {/* kv-lang-ok: a long Finnish word, a hard case for wrapping */}
          <Card.Body>Put the bin out by 6 a.m.</Card.Body>
        </Card.Root>
      </>
    ),
  },
  argTypes: {
    as: { control: false, description: 'Another element: `ul`, `ol`, `li`, `section` or `form`.' },
  },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

/** A vertical rhythm of `space-6`. The children keep the order of the DOM. */
export const Default: Story = {}

/** `kv-stack--gap-2`: tight, for a title and its meta line. */
export const Gap2: Story = { args: { className: 'kv-stack--gap-2' } }

/** `kv-stack--gap-4`: related blocks. */
export const Gap4: Story = { args: { className: 'kv-stack--gap-4' } }

/** `kv-stack--gap-8`: the sections of a page. */
export const Gap8: Story = { args: { className: 'kv-stack--gap-8' } }

/** `as="ul"`: a list with one announced count, and the bullets left to the theme. */
export const AsList: Story = {
  render: (args) => (
    <Stack as="ul" className={args.className}>
      {/* kv-lang-ok: a long Finnish word, a hard case for wrapping */}
      <li>Waste collection</li>
      <li>Building permits</li>
      <li>School transport</li>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
  },
}

/** A 320px column with a long Finnish word: it wraps and nothing scrolls sideways (1.4.10). */
export const Reflow320: Story = {
  args: {
    children: (
      <Card.Root>
        {/* kv-lang-ok: a long Finnish word, a hard case for wrapping */}
        <Card.Body>Jätehuoltomaksunpalautuspäätöksentarkistuslomake</Card.Body>
      </Card.Root>
    ),
  },
  decorators: [(Story) => <div className="kv-story-narrow">{<Story />}</div>],
  globals: { locale: 'fi' },
  play: async ({ canvasElement }) => {
    const column = canvasElement.querySelector<HTMLElement>('.kv-story-narrow')
    if (column === null) {
      throw new Error('no narrow column')
    }
    await expectNoHorizontalOverflow(column)
  },
}

/** Right to left: a stack is vertical, so only the text direction changes. */
export const RTL: Story = { globals: { dir: 'rtl', locale: 'en' } }

/** The cards' edges survive forced colours. */
export const ForcedColors: Story = { globals: { forcedColors: 'active' } }
