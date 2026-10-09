import { CopyButton } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/copy-button/copy-button.a11y.md?raw'
import guide from '../../../../../packages/react/src/copy-button/copy-button.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef } from 'react'
import { expect, waitFor } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { withCopyMessages } from './copy-button.fixture.tsx'
import { expectMinimumTargetSize, expectNoHorizontalOverflow } from '../theme-story-assertions.ts'

// Components/CopyButton: a Button that copies a text, styled by @kvirn-ui/theme/theme.css
// (contract: copy-button.a11y.md). The Clipboard API is stubbed in the plays that click, so the
// result doesn't depend on the browser's permission prompt.

const referenceNumber = 'PK-2026-004217'

/** Replaces `navigator.clipboard` for one story, and puts the real one back afterwards. */
function stubClipboard(clipboard: Pick<Clipboard, 'writeText'> | undefined) {
  Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true })
  return () => {
    Reflect.deleteProperty(navigator, 'clipboard')
  }
}

const meta = {
  title: 'Components/CopyButton',
  component: CopyButton,
  args: { text: referenceNumber },
  decorators: [withCopyMessages],
  argTypes: { textRef: { control: false } },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

function ReferenceNumber(props: Partial<React.ComponentProps<typeof CopyButton>>) {
  const numberRef = useRef<HTMLSpanElement>(null)
  return (
    <p>
      Ditt ärendenummer är{' '}
      <span ref={numberRef} data-testid="number">
        {referenceNumber}
      </span>{' '}
      <CopyButton text={referenceNumber} textRef={numberRef} {...props}>
        Kopiera ärendenumret
      </CopyButton>
    </p>
  )
}

/** The name is its label and stays the same after a copy: the result is announced instead. */
export const Default: Story = {
  beforeEach: () => stubClipboard({ writeText: async () => {} }),
  render: () => <ReferenceNumber />,
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Kopiera ärendenumret' })
    await expect(button).toHaveAttribute('type', 'button')
    await expectMinimumTargetSize(button)
    await userEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('data-status', 'copied'))
    await waitFor(() =>
      expect(canvas.getByText('Kopierat', { selector: '.kv-copy-status' })).toBeVisible(),
    )
    await expect(canvas.getByRole('button', { name: 'Kopiera ärendenumret' })).toBe(button)
  },
}

/** The default label, from the message `copyButton.label`. */
export const DefaultLabel: Story = {
  render: (args) => <CopyButton {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Kopiera' })).toBeVisible()
  },
}

/** The browser refuses: the failure is announced and the number is selected, so Ctrl+C works. */
export const Failed: Story = {
  beforeEach: () => stubClipboard(undefined),
  render: () => <ReferenceNumber />,
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Kopiera ärendenumret' })
    await userEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('data-status', 'failed'))
    await expect(
      canvas.getByText(/Det gick inte att kopiera/, { selector: '.kv-copy-status' }),
    ).toBeVisible()
    await expect(window.getSelection()?.toString()).toBe(referenceNumber)
  },
}

/** Disabled copies nothing and is skipped by Tab. Focusable disabled stays in the Tab order. */
export const Disabled: Story = {
  render: () => (
    <p>
      <CopyButton text={referenceNumber} disabled>
        Kopiera
      </CopyButton>{' '}
      <CopyButton text={referenceNumber} disabled focusableWhenDisabled>
        Kopiera (fokuserbar)
      </CopyButton>
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /^Kopiera$/ })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Kopiera (fokuserbar)' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/** Tab reaches the button, Enter or Space copies, and focus stays on it. */
export const Keyboard: Story = {
  beforeEach: () => stubClipboard({ writeText: async () => {} }),
  render: () => <ReferenceNumber />,
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Kopiera ärendenumret' })
    await userEvent.tab()
    await expect(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(button).toHaveAttribute('data-status', 'copied'))
    await expect(button).toHaveFocus()
  },
}

/** Right to left, in English: the label is the message, and the status follows the button at the inline end. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  beforeEach: () => stubClipboard({ writeText: async () => {} }),
  render: (args) => (
    <p>
      Case number <bdi>{referenceNumber}</bdi> <CopyButton {...args} />
    </p>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }))
    await waitFor(() =>
      expect(canvas.getByText('Copied', { selector: '.kv-copy-status' })).toBeVisible(),
    )
  },
}

/** Forced colours: a Button, so the system's button colours and focus ring apply. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: () => (
    <p>
      <CopyButton text={referenceNumber}>Kopiera</CopyButton>{' '}
      <CopyButton text={referenceNumber} disabled focusableWhenDisabled>
        Kopiera (fokuserbar)
      </CopyButton>
    </p>
  ),
}

/** A Finnish label in a narrow column wraps instead of overflowing (1.4.10). */
export const Narrow: Story = {
  globals: { locale: 'fi' },
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <CopyButton text={referenceNumber}>
        Kopioi rakennuslupahakemuksen numero leikepöydälle
      </CopyButton>
    </div>
  ),
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** At 320 CSS px the failure text wraps below the button and nothing overflows (1.4.10). */
export const NarrowFailed: Story = {
  beforeEach: () => stubClipboard(undefined),
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <ReferenceNumber />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Kopiera ärendenumret' }))
    await waitFor(() =>
      expect(
        canvas.getByText(/Det gick inte att kopiera/, { selector: '.kv-copy-status' }),
      ).toBeVisible(),
    )
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** `status={false}` renders no visible status: draw your own from `data-status`. */
export const WithoutStatus: Story = {
  beforeEach: () => stubClipboard({ writeText: async () => {} }),
  render: () => <ReferenceNumber status={false} />,
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Kopiera ärendenumret' })
    await userEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('data-status', 'copied'))
    await expect(canvas.queryByText('Kopierat', { selector: '.kv-copy-status' })).toBeNull()
  },
}
