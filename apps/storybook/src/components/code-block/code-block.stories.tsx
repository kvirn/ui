import { CodeBlock } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/code-block/code-block.a11y.md?raw'
import guide from '../../../../../packages/react/src/code-block/code-block.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { withCopyMessages } from '../copy-button/copy-button.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/CodeBlock: a labelled code sample with a copy button, styled by
// @kvirn-ui/theme/theme.css (contract: code-block.a11y.md). No highlighting, and the code wraps.

const command = 'pnpm add @kvirn-ui/react @kvirn-ui/theme'
const longLine =
  'curl --request POST https://api.exempelkommun.example/e-tjanster/parkeringstillstand/ansokningar --header "Content-Type: application/json" --data @ansokan.json'

function stubClipboard(clipboard: Pick<Clipboard, 'writeText'> | undefined) {
  Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true })
  return () => {
    Reflect.deleteProperty(navigator, 'clipboard')
  }
}

const meta = {
  title: 'Components/Content/CodeBlock',
  component: CodeBlock.Root,
  decorators: [withCopyMessages],
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof CodeBlock.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A label names the group, the code wraps, and Copy is the one Tab stop. */
export const Default: Story = {
  beforeEach: () => stubClipboard({ writeText: async () => {} }),
  render: (args) => (
    <CodeBlock.Root {...args}>
      <CodeBlock.Label>Installera</CodeBlock.Label>
      <CodeBlock.Code>{command}</CodeBlock.Code>
      <CodeBlock.Copy />
    </CodeBlock.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('group', { name: 'Installera' })).toBeVisible()
    const copy = canvas.getByRole('button', { name: 'Kopiera' })
    await userEvent.click(copy)
    await waitFor(() => expect(copy).toHaveAttribute('data-status', 'copied'))
  },
}

/** Without a label the Root is a plain `div`: no empty group. */
export const WithoutLabel: Story = {
  render: (args) => (
    <CodeBlock.Root {...args} data-testid="root">
      <CodeBlock.Code>{command}</CodeBlock.Code>
      <CodeBlock.Copy />
    </CodeBlock.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('root')).not.toHaveAttribute('role')
  },
}

/** Copying is refused: the code is selected, so Ctrl+C works. */
export const Failed: Story = {
  beforeEach: () => stubClipboard(undefined),
  render: (args) => (
    <CodeBlock.Root {...args}>
      <CodeBlock.Label>Installera</CodeBlock.Label>
      <CodeBlock.Code>{command}</CodeBlock.Code>
      <CodeBlock.Copy />
    </CodeBlock.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const copy = canvas.getByRole('button', { name: 'Kopiera' })
    await userEvent.click(copy)
    await waitFor(() => expect(copy).toHaveAttribute('data-status', 'failed'))
    await expect(
      canvas.getByText(/Det gick inte att kopiera/, { selector: '.kv-copy-status' }),
    ).toBeVisible()
    await expect(window.getSelection()?.toString()).toBe(command)
  },
}

/** A long line wraps at 320 CSS px: no horizontal scrolling, no scroller to reach (1.4.10). */
export const Narrow: Story = {
  render: (args) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <CodeBlock.Root {...args}>
        <CodeBlock.Label>Skicka ansökan</CodeBlock.Label>
        <CodeBlock.Code>{longLine}</CodeBlock.Code>
        <CodeBlock.Copy />
      </CodeBlock.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** At 320 CSS px the failure text wraps below Copy and nothing overflows (1.4.10). */
export const NarrowFailed: Story = {
  beforeEach: () => stubClipboard(undefined),
  render: (args) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <CodeBlock.Root {...args}>
        <CodeBlock.Label>Installera</CodeBlock.Label>
        <CodeBlock.Code>{command}</CodeBlock.Code>
        <CodeBlock.Copy />
      </CodeBlock.Root>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Kopiera' }))
    await waitFor(() =>
      expect(
        canvas.getByText(/Det gick inte att kopiera/, { selector: '.kv-copy-status' }),
      ).toBeVisible(),
    )
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** In an article: prose leaves the code block as it is outside prose. */
export const InProse: Story = {
  render: (args) => (
    <div className="kv-prose">
      <p>Installera paketen:</p>
      <CodeBlock.Root {...args}>
        <CodeBlock.Label>Installera</CodeBlock.Label>
        <CodeBlock.Code>
          <code>{command}</code>
        </CodeBlock.Code>
        <CodeBlock.Copy />
      </CodeBlock.Root>
    </div>
  ),
}

/** Tab skips the code and reaches Copy. Enter copies, and focus stays. */
export const Keyboard: Story = {
  beforeEach: () => stubClipboard({ writeText: async () => {} }),
  render: (args) => (
    <CodeBlock.Root {...args}>
      <CodeBlock.Label>Installera</CodeBlock.Label>
      <CodeBlock.Code>{command}</CodeBlock.Code>
      <CodeBlock.Copy />
    </CodeBlock.Root>
  ),
  play: async ({ canvas, userEvent }) => {
    const copy = canvas.getByRole('button', { name: 'Kopiera' })
    await userEvent.tab()
    await expect(copy).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(copy).toHaveAttribute('data-status', 'copied'))
    await expect(copy).toHaveFocus()
  },
}

/** Right to left, in English: the code stays left to right, the label and the button follow the page. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: (args) => (
    <CodeBlock.Root {...args}>
      <CodeBlock.Label>Install</CodeBlock.Label>
      <CodeBlock.Code dir="ltr">{command}</CodeBlock.Code>
      <CodeBlock.Copy />
    </CodeBlock.Root>
  ),
  beforeEach: () => stubClipboard({ writeText: async () => {} }),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('group', { name: 'Install' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    await waitFor(() =>
      expect(canvas.getByText('Copied', { selector: '.kv-copy-status' })).toBeVisible(),
    )
  },
}

/** Forced colours: the code keeps its edge in CanvasText. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (args) => (
    <CodeBlock.Root {...args}>
      <CodeBlock.Label>Installera</CodeBlock.Label>
      <CodeBlock.Code>{command}</CodeBlock.Code>
      <CodeBlock.Copy />
    </CodeBlock.Root>
  ),
}
