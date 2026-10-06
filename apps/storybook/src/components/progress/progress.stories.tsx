import { Progress } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/progress/progress.a11y.md?raw'
import guide from '../../../../../packages/react/src/progress/progress.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf } from '../form/form.fixture.tsx'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import { progressTextsFor, SendApplication } from './progress.fixture.tsx'

// Components/Progress: a wait shown as text, and a native bar only when the value is known,
// styled by @kvirn-ui/theme/theme.css (design spec docs/design/status-patterns.md). It renders
// nothing for the first second. The state stories set delayMilliseconds to 0 and announce to
// false, so they show the state at once and do not speak in the story page; the real timing is
// proved in progress.test.tsx. Progress has no focusable part, so there is no Keyboard story.

const meta = {
  title: 'Components/Progress',
  component: Progress.Root,
  argTypes: {
    label: {
      control: 'text',
      description: 'What is happening. It names the bar and is announced.',
    },
    value: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Known progress. The bar renders only with a value.',
    },
    max: { control: 'number', description: 'The value that means done. Default 100.' },
    delayMilliseconds: { control: 'number', description: 'Invisible for this long. Default 1000.' },
    slowAfterMilliseconds: {
      control: 'number',
      description: 'When the slow sentence is added. Default 10000.',
    },
    announce: {
      control: 'boolean',
      description: 'Announce the label once and the slow sentence once. Default true.',
    },
    messages: { control: false, description: 'Per-instance `loading`, `slow` and `valueText`.' },
    render: { control: false, description: 'Another element for the Root.' },
  },
  args: { delayMilliseconds: 0, announce: false },
  globals: { locale: 'sv' },
  render: (args, { globals }) => {
    const { text, lang } = progressTextsFor(localeOf(globals))
    return (
      <div lang={lang}>
        <Progress.Root {...args} label={args.label ?? text.sending}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      </div>
    )
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof Progress.Root>

export default meta
type Story = StoryObj<typeof meta>

/** An unknown wait: the label is the whole cue. No spinner, no bar, nothing moves. */
export const Default: Story = {
  play: async ({ canvas, globals }) => {
    const { text } = progressTextsFor(localeOf(globals))
    await expect(await canvas.findByText(text.sending)).toBeVisible()
    await expect(canvas.queryByRole('progressbar')).toBeNull()
  },
}

/** A known value: the label shows the percent, and a native `<progress>` draws it. */
export const Determinate: Story = {
  args: { value: 45 },
  play: async ({ canvas, globals }) => {
    const { text } = progressTextsFor(localeOf(globals))
    const bar = await canvas.findByRole('progressbar', { name: text.sending })
    await expect(bar).toHaveAttribute('value', '45')
    await expect(bar).toHaveAttribute('max', '100')
  },
}

/** After the slow limit the sentence is added to the label. Shortened here to one millisecond. */
export const Slow: Story = {
  args: { slowAfterMilliseconds: 1 },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByText(/\./, { selector: '.kv-progress-slow' })).toBeVisible(),
    )
  },
}

/** A long label wraps over lines and is never truncated. */
export const LongLabel: Story = {
  globals: { locale: 'fi' },
  args: { value: 60 },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow">
        <Story />
      </div>
    ),
  ],
  render: (args, { globals }) => {
    const { text, lang } = progressTextsFor(localeOf(globals))
    return (
      <div lang={lang}>
        <Progress.Root {...args} label={text.longLabel}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(await canvas.findByTestId('narrow'))
  },
}

/**
 * The pattern for a long action: a busy Button (focus stays, every press is blocked) with a
 * Progress right after it. Press the button: nothing shows for the first second, then the label
 * appears and is announced once.
 */
export const WithBusyButton: Story = {
  args: { delayMilliseconds: undefined, announce: undefined },
  parameters: showSource('progress/progress.fixture.tsx', 'SendApplication'),
  render: (_args, { globals }) => <SendApplication locale={localeOf(globals)} />,
  play: async ({ canvas, globals }) => {
    const { text } = progressTextsFor(localeOf(globals))
    const button = canvas.getByRole('button', { name: text.send })
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await expect(button).toHaveAttribute('data-busy')
    await expect(button).toHaveFocus()
    await expect(canvas.queryByText(text.sending)).toBeNull()
    await expect(await canvas.findByText(text.sending)).toBeVisible()
  },
}

/** The wait fails: the Progress goes, an Alert takes its place, and the button is usable again. */
export const Failed: Story = {
  args: { delayMilliseconds: undefined, announce: undefined },
  parameters: showSource('progress/progress.fixture.tsx', 'SendApplication'),
  render: (_args, { globals }) => (
    <SendApplication locale={localeOf(globals)} succeedAfterMilliseconds={1200} fail />
  ),
  play: async ({ canvas, globals }) => {
    const { text } = progressTextsFor(localeOf(globals))
    await userEvent.click(canvas.getByRole('button', { name: text.send }))
    await expect(await canvas.findByText(text.failed, undefined, { timeout: 4000 })).toBeVisible()
    await expect(canvas.getByRole('button', { name: text.send })).not.toHaveAttribute(
      'aria-disabled',
    )
  },
}

// Every state in one column. The RTL and ForcedColors stories render it.
const renderProgressStates: NonNullable<Story['render']> = (_args, { globals }) => {
  const { text, lang } = progressTextsFor(localeOf(globals))
  return (
    <div className="kv-story-form" lang={lang}>
      <Progress.Root label={text.sending} delayMilliseconds={0} announce={false}>
        <Progress.Label />
      </Progress.Root>
      <Progress.Root label={text.exporting} value={45} delayMilliseconds={0} announce={false}>
        <Progress.Label />
        <Progress.Bar />
      </Progress.Root>
      <Progress.Root
        label={text.sending}
        delayMilliseconds={0}
        slowAfterMilliseconds={1}
        announce={false}
      >
        <Progress.Label />
      </Progress.Root>
    </div>
  )
}

/** Right to left, in English: the label is start-aligned and the bar fills from the right. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: renderProgressStates,
}

/** Text in `CanvasText`, the bar's edge `CanvasText` on a `Canvas` track, the value `Highlight`. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: renderProgressStates,
}
