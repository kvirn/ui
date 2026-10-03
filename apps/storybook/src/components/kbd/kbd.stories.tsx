import { Kbd } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/kbd/kbd.a11y.md?raw'
import guide from '../../../../../packages/react/src/kbd/kbd.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'

// Components/Kbd: the headless Kbd, styled by @kvirn-ui/theme. A key is text, not a
// control, so there's no focusable part and no Keyboard story.

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  args: { children: 'Tab', lang: 'en' },
  argTypes: { render: { control: false } },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

/** A key in running text. */
export const Default: Story = {
  render: (args) => (
    <p>
      Du kan flytta mellan fälten i formuläret med <Kbd {...args} />.
    </p>
  ),
  play: async ({ canvas }) => {
    const key = canvas.getByText('Tab')
    await expect(key.tagName).toBe('KBD')
    await expect(key).toHaveClass('kv-kbd')
    const style = getComputedStyle(key)
    await expect(style.whiteSpace).toBe('nowrap')
    // Flat: depth means "press me" and is for buttons only. The key uses the text's own font.
    await expect(style.borderBlockEndWidth).toBe('1px')
    await expect(style.fontFamily).toBe(getComputedStyle(key.parentElement!).fontFamily)
  },
}

/** A combination: an outer `Kbd` groups one `Kbd` per key. Only the keys are drawn. */
export const Combination: Story = {
  render: () => (
    <p>
      Kopiera med{' '}
      <Kbd data-testid="combination">
        <Kbd lang="en">Ctrl</Kbd>+<Kbd lang="en">C</Kbd>
      </Kbd>
      .
    </p>
  ),
  play: async ({ canvas }) => {
    const outer = canvas.getByTestId('combination')
    const paragraph = outer.parentElement!
    // The group is plain, in the text's font, so the line keeps its height.
    await expect(getComputedStyle(outer).borderBlockEndWidth).toBe('0px')
    await expect(getComputedStyle(outer).fontFamily).toBe(getComputedStyle(paragraph).fontFamily)
    await expect(getComputedStyle(canvas.getByText('Ctrl')).borderBlockEndWidth).toBe('1px')
    await expect(paragraph.getBoundingClientRect().height).toBe(
      Number.parseFloat(getComputedStyle(paragraph).lineHeight),
    )
  },
}

/** Inside Prose, and in a heading's size. A key is the same size as inline code. */
export const InProse: Story = {
  render: () => (
    <div className="kv-prose">
      <p>
        Tryck på <Kbd lang="en">Esc</Kbd> för att stänga, eller{' '}
        <Kbd>
          <Kbd lang="en">Shift</Kbd>+<Kbd lang="en">Tab</Kbd>
        </Kbd>{' '}
        för att gå bakåt.
      </p>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Esc')).toBeVisible()
  },
}

/** Right to left: the key keeps its shape, and its name keeps its direction. */
export const RTL: Story = {
  render: () => (
    <p dir="rtl" lang="ar">
      اضغط على <Kbd lang="en">Tab</Kbd> للانتقال.
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Tab')).toHaveClass('kv-kbd')
  },
}
