import { Heading } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/heading/heading.a11y.md?raw'
import guide from '../../../../../packages/react/src/heading/heading.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/Heading: the headless Heading. It has no focusable part, so there's no
// Keyboard story.

const meta = {
  title: 'Components/Content/Heading',
  component: Heading,
  args: { as: 'h2', children: 'Kontakta oss' },
  argTypes: {
    as: { control: 'inline-radio', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
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
        'The look, apart from the level: a type role. Without it each level looks like the role of its number (`as="h4"` is `heading-4`). Sets the modifier class `kv-heading--<size>`.',
    },
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

/** `as` is the element: `<Heading as="h2">` is an `<h2>`. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Kontakta oss' })).toBeVisible()
  },
}

// The sizes, display and heading-1 to heading-6, for the Sizes, RightToLeft and ForcedColors stories: the same markup, so a reader
// of any of them sees the real Headings.
const renderSizes: NonNullable<Story['render']> = () => (
  <>
    <Heading as="h1" size="display">
      display (h1)
    </Heading>
    <Heading as="h1" size="heading-1">
      heading-1 (h1)
    </Heading>
    <Heading as="h2" size="heading-2">
      heading-2 (h2)
    </Heading>
    <Heading as="h3" size="heading-3">
      heading-3 (h3)
    </Heading>
    <Heading as="h3" size="heading-2">
      heading-2 on an h3
    </Heading>
    <Heading as="h4">heading-4 (h4)</Heading>
    <Heading as="h5">heading-5 (h5)</Heading>
    <Heading as="h6">heading-6 (h6)</Heading>
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
      <Heading as="h1">Tjänster</Heading>
      <Heading as="h2">Avfall och återvinning</Heading>
      <Heading as="h3">Sophämtning</Heading>
      <Heading as="h4">Öppettider</Heading>
      <Heading as="h5">Helger</Heading>
      <Heading as="h6">Midsommarafton</Heading>
      <Heading as="h3">Återvinningscentral</Heading>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading')).toHaveLength(7)
    await expect(canvas.getByRole('heading', { level: 6, name: 'Midsommarafton' })).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible()
  },
}

/**
 * `size` works on every level, also h4 to h6: here an `h4` set as heading-3, an `h5` as heading-4
 * and an `h6` as heading-5. `id` on a Heading names the `<section>` it labels (`aria-labelledby`),
 * which makes the section a region users can jump to.
 */
export const SizeOnDeepLevelsAndLabelledRegion: Story = {
  decorators: inColumn,
  render: () => (
    <section aria-labelledby="oppettider">
      <Heading as="h4" size="heading-3" id="oppettider">
        Öppettider
      </Heading>
      <Heading as="h5" size="heading-4">
        Helger
      </Heading>
      <Heading as="h6" size="heading-5">
        Midsommarafton
      </Heading>
    </section>
  ),
  play: async ({ canvas }) => {
    const region = canvas.getByRole('region', { name: 'Öppettider' })
    await expect(region).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 4, name: 'Öppettider' })).toHaveAttribute(
      'id',
      'oppettider',
    )
    await expect(canvas.getByRole('heading', { level: 5, name: 'Helger' })).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 6, name: 'Midsommarafton' })).toBeVisible()
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
