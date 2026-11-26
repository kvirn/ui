import { Kbd } from '@kvirn/ui'
import contract from '../../../../../packages/react/src/kbd/kbd.a11y.md?raw'
import guide from '../../../../../packages/react/src/kbd/kbd.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { usageGuide } from '../../docs-source.ts'

// Components/Kbd: the headless Kbd, styled by @kvirn/theme. A key is text, not a
// control, so there's no focusable part and no Keyboard story.

const meta = {
  title: 'Components/Content/Kbd',
  component: Kbd,
  args: { children: 'Tab' },
  argTypes: { as: { control: false } },
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
      You can move between the fields in the form with <Kbd {...args} />.
    </p>
  ),
}

/** A combination: an outer `Kbd` groups one `Kbd` per key. Only the keys are drawn. */
export const Combination: Story = {
  render: () => (
    <p>
      Copy with{' '}
      <Kbd data-testid="combination">
        <Kbd>Ctrl</Kbd>+<Kbd>C</Kbd>
      </Kbd>
      .
    </p>
  ),
}

/** Inside Prose, and in a heading's size. A key is the same size as inline code. */
export const InProse: Story = {
  render: () => (
    <div className="kv-prose">
      <p>
        Press <Kbd>Esc</Kbd> to close, or{' '}
        <Kbd>
          <Kbd>Shift</Kbd>+<Kbd>Tab</Kbd>
        </Kbd>{' '}
        to go back.
      </p>
    </div>
  ),
}

/** Right to left: the key keeps its shape, and its name keeps its direction. */
export const RTL: Story = {
  render: () => (
    <p dir="rtl" lang="ar">
      اضغط على{' '}
      <span lang="en">
        <Kbd>Tab</Kbd>
      </span>{' '}
      للانتقال.
    </p>
  ),
}
