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
  title: 'Components/Stack',
  component: Stack,
  args: {
    children: (
      <>
        <Heading level={2}>Sophämtning</Heading>
        <Card.Root>
          <Card.Body>Nästa hämtning är på tisdag.</Card.Body>
        </Card.Root>
        <Card.Root>
          <Card.Body>Ställ ut kärlet senast klockan 06.</Card.Body>
        </Card.Root>
      </>
    ),
  },
  argTypes: {
    gap: {
      control: 'inline-radio',
      options: ['2', '4', '6', '8'],
      description: 'The `space` step between the children: 2, 4, 6 (default) or 8.',
    },
    render: { control: false },
  },
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

/** A vertical rhythm of `space-6`. The children keep the order of the DOM. */
export const Default: Story = {}

/** `gap="2"`: tight, for a title and its meta line. */
export const Gap2: Story = { args: { gap: '2' } }

/** `gap="4"`: related blocks. */
export const Gap4: Story = { args: { gap: '4' } }

/** `gap="8"`: the sections of a page. */
export const Gap8: Story = { args: { gap: '8' } }

/** `render={<ul role="list" />}`: a list with one announced count, and the bullets left to the theme. */
export const AsList: Story = {
  render: (args) => (
    <Stack {...args} render={<ul role="list" />}>
      <li>Sophämtning</li>
      <li>Bygglov</li>
      <li>Skolskjuts</li>
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
