import { Heading, VisuallyHidden } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/visually-hidden/visually-hidden.a11y.md?raw'
import guide from '../../../../../packages/react/src/visually-hidden/visually-hidden.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/VisuallyHidden: the headless VisuallyHidden, styled by @kvirn-ui/theme. Its text is
// not drawn, so each story shows what a screen reader gets in the sentence around it. It has no
// focusable part and no Keyboard story.

const meta = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  args: { children: ', 3 resultat' },
  argTypes: { render: { control: false } },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof VisuallyHidden>

export default meta
type Story = StoryObj<typeof meta>

/** Text for a screen reader after the visible text. It takes no room: select the paragraph to see it. */
export const Default: Story = {
  render: (args) => (
    <p>
      Sökträffar
      <VisuallyHidden {...args} />
    </p>
  ),
  play: async ({ canvas }) => {
    const hidden = canvas.getByText(', 3 resultat')
    await expect(hidden).toBeInTheDocument()
    await expect(hidden.getBoundingClientRect().width).toBeLessThanOrEqual(1)
  },
}

/** A heading nobody sees, for a landmark's structure: `render` changes the element. */
export const AsHeading: Story = {
  render: () => (
    <nav aria-label="Huvudmeny">
      <VisuallyHidden render={<Heading level={2} />}>Meny</VisuallyHidden>
      <a href="/">Startsidan</a>
    </nav>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 2, name: 'Meny' })).toBeInTheDocument()
  },
}

/** Right to left: the text keeps its place in the reading order. */
export const RTL: Story = {
  globals: { dir: 'rtl' },
  render: () => (
    <p dir="rtl" lang="ar">
      النتائج
      <VisuallyHidden lang="ar">، ٣ نتائج</VisuallyHidden>
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('، ٣ نتائج')).toBeInTheDocument()
  },
}

/** Forced colours change nothing: the text is not drawn in any mode. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (args) => (
    <p>
      Sökträffar
      <VisuallyHidden {...args} />
    </p>
  ),
}
