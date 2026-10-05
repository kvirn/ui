import { Heading } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/heading/heading.a11y.md?raw'
import guide from '../../../../../packages/react/src/heading/heading.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/Heading: the headless Heading. It has no focusable part, so there's no
// Keyboard story.

const meta = {
  title: 'Components/Heading',
  component: Heading,
  args: { level: 2, children: 'Kontakta oss' },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: {
      control: 'select',
      options: [
        undefined,
        'display',
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
        'heading-5',
        'heading-6',
      ],
      description:
        'The look, apart from the level: a type role. Without it each level looks like the role of its number (`level={4}` is `heading-4`). Sets the modifier class `kv-heading--<size>`.',
    },
    render: { control: false },
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

/** `level` is the element: `<Heading level={2}>` is an `<h2>`. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Kontakta oss' })).toBeVisible()
  },
}

// The sizes, display and heading-1 to heading-6, for the Sizes, RightToLeft and ForcedColors stories: the same markup, so a reader
// of any of them sees the real Headings.
const renderSizes: NonNullable<Story['render']> = () => (
  <>
    <Heading level={1} size="display">
      display (h1)
    </Heading>
    <Heading level={1} size="heading-1">
      heading-1 (h1)
    </Heading>
    <Heading level={2} size="heading-2">
      heading-2 (h2)
    </Heading>
    <Heading level={3} size="heading-3">
      heading-3 (h3)
    </Heading>
    <Heading level={3} size="heading-2">
      heading-2 on an h3
    </Heading>
    <Heading level={4}>heading-4 (h4)</Heading>
    <Heading level={5}>heading-5 (h5)</Heading>
    <Heading level={6}>heading-6 (h6)</Heading>
  </>
)

// The column the sizes stack in is layout, so it is a decorator and not part of the example.
const inColumn: NonNullable<Story['decorators']> = [
  (Story) => (
    <div className="kv-story-card-column">
      <Story />
    </div>
  ),
]

/** The level is the outline and `size` is the look: an `h3` set as heading-2, an `h1` as display. Each level has its own size by default, h1 to h6. */
export const Sizes: Story = {
  decorators: inColumn,
  render: renderSizes,
  play: async ({ canvas }) => {
    // The level is the outline, whatever the size: the h3 set as heading-2 is still an h3.
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'heading-2 on an h3' }),
    ).toBeVisible()
  },
}

/** An outline with all six levels: one `h1`, then each level in turn without skipping one. */
export const Outline: Story = {
  render: () => (
    <div className="kv-prose">
      <Heading level={1}>Tjänster</Heading>
      <Heading level={2}>Avfall och återvinning</Heading>
      <Heading level={3}>Sophämtning</Heading>
      <Heading level={4}>Öppettider</Heading>
      <Heading level={5}>Helger</Heading>
      <Heading level={6}>Midsommarafton</Heading>
      <Heading level={3}>Återvinningscentral</Heading>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading')).toHaveLength(7)
    await expect(canvas.getByRole('heading', { level: 6, name: 'Midsommarafton' })).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible()
  },
}

/** Right to left, in English: a heading starts at the right, and its size and weight don't change. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: { dir: 'rtl', locale: 'en' },
  decorators: inColumn,
  render: renderSizes,
}

/** Forced colours: a heading is drawn in the system text colour. It sets no background or edge, so there is nothing more to check. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  decorators: inColumn,
  render: renderSizes,
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { name: 'heading-2 (h2)' })
    await expect(heading).toBeVisible()
  },
}
