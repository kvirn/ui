import { QuickExit } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/quick-exit/quick-exit.a11y.md?raw'
import guide from '../../../../../packages/react/src/quick-exit/quick-exit.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn } from 'storybook/test'
import { usageGuide } from '../../docs-source.ts'
import { withQuickExitMessages } from './quick-exit.fixture.tsx'

// Components/QuickExit: the headless QuickExit, styled by @kvirn-ui/theme (contract:
// quick-exit.a11y.md). Every story passes its own `navigate`, so a story never leaves Storybook.
// The real exit hides the page, so the stand-in shows it again and logs the destination.

const destination = 'https://www.smhi.se'
const originalTitle = document.title

function createNavigate(onLeave?: (href: string) => void) {
  return fn((href: string) => {
    document.documentElement.style.removeProperty('display')
    onLeave?.(href)
  })
}

const restorePage = () => () => {
  document.documentElement.style.removeProperty('display')
  document.title = originalTitle
}

const meta = {
  title: 'Components/Actions/QuickExit',
  component: QuickExit.Root,
  args: { navigate: createNavigate() },
  beforeEach: restorePage,
  decorators: [withQuickExitMessages],
  argTypes: { navigate: { control: false } },
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof QuickExit.Root>

export default meta
type Story = StoryObj<typeof meta>

function Page({ children }: { children?: React.ReactNode }) {
  return (
    <div data-testid="page">
      {children}
      <main>
        <h1>Support if you are in an abusive relationship</h1>
        <p>Here you can find information about how to get help and where to turn.</p>
      </main>
    </div>
  )
}

/** Press the link, or Shift three times within five seconds, to replace this page with the site you chose. */
export const Default: Story = {
  render: (args) => (
    <Page>
      <QuickExit.Root {...args}>
        <QuickExit.Link href={destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
    </Page>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Leave this page' })
    await expect(link).toHaveAttribute('href', destination)
    await expect(link).toHaveAttribute('rel', 'noreferrer')
  },
}

/** `shortcut={false}`: only the link leaves. Shift presses are neither counted nor announced. */
export const ShortcutOff: Story = {
  render: (args) => (
    <Page>
      <QuickExit.Root {...args} shortcut={false}>
        <QuickExit.Link href={destination} />
      </QuickExit.Root>
    </Page>
  ),
}

/** Right to left, in English. */
export const RTL: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 240 } } },
  globals: { dir: 'rtl', locale: 'en' },
  render: (args) => (
    <Page>
      <QuickExit.Root {...args}>
        <QuickExit.Link href={destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
    </Page>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Leave this page' })).toBeVisible()
  },
}

/** Forced colours: the link keeps a border and the system's link colours. */
export const ForcedColors: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 240 } } },
  globals: { forcedColors: 'active' },
  render: (args) => (
    <Page>
      <QuickExit.Root {...args}>
        <QuickExit.Link href={destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
    </Page>
  ),
}

/** A long Finnish label wraps instead of overflowing. */
export const LongLabel: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
  globals: { locale: 'fi' },
  render: (args) => (
    <div className="kv-story-narrow" data-testid="narrow">
      <QuickExit.Root {...args}>
        <QuickExit.Link href={destination}>
          {/* kv-lang-ok: Finnish locale story: a long label */}
          Poistu tältä sivulta heti ja siirry turvalliselle sivustolle
        </QuickExit.Link>
        <QuickExit.Hint />
      </QuickExit.Root>
    </div>
  ),
}

/** The row is a direct child of the page, early in the focus order, with long content below it. */
export const InContext: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 480 } } },
  render: (args) => (
    <div data-testid="page">
      <QuickExit.Root {...args}>
        <QuickExit.Link href={destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
      <main>
        <h1>Support if you are in an abusive relationship</h1>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index}>
            If you are in danger right now, call 112. You can also contact the helpline around the
            clock, and the call does not show on your phone bill.
          </p>
        ))}
      </main>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Leave this page' })).toBeVisible()
  },
}

function KeyboardFixture({ args }: { args: React.ComponentProps<typeof QuickExit.Root> }) {
  const [log, setLog] = useState<string[]>([])
  const navigate = createNavigate((href) => setLog((entries) => [...entries, `navigate(${href})`]))
  return (
    <Page>
      <QuickExit.Root {...args} navigate={navigate}>
        <QuickExit.Link href={destination} />
        <QuickExit.Hint />
      </QuickExit.Root>
      <p>Log:</p>
      <ul aria-label="Exit log">
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </Page>
  )
}

/**
 * Try the keys: Tab reaches the link, Enter leaves, Space does nothing. Shift three times leaves
 * from anywhere; Shift once or twice is announced, and any other key starts again.
 */
export const Keyboard: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
  render: (args) => <KeyboardFixture args={args} />,
}
