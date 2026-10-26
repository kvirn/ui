import { ReadAloud } from '@kvirn-ui/read-aloud'
import contract from '../../../../../packages/read-aloud/src/read-aloud.a11y.md?raw'
import guide from '../../../../../packages/read-aloud/src/read-aloud.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { chromeViewports, wideGlobals } from '../../patterns/patterns-story-support.tsx'
import {
  ArticleWithBar,
  ArticleWithPlayer,
  ArticleWithPlayerInFinnish,
  createFakeEngine,
  useFakeEngine,
  withReadAloudMessages,
} from './read-aloud.fixture.tsx'
import type { FakeEngineOptions } from './read-aloud.fixture.tsx'

// Components/ReadAloud: a player that reads a region aloud, one sentence at a time, on the Kvirn
// voice service (contract: read-aloud.a11y.md; design spec docs/design/read-aloud.md). Every
// story uses a fake engine from the fixture, so nothing is ever spoken and nothing ever reaches
// the network (plan 0153 D6). A story that shows a state reaches it in `play`, as a person would:
// nothing starts by itself. Every story runs inside the real site page frame (0154 D27, D28, T8):
// the Bar sits above `SiteHeader` at full page width, and the inline button row sits under the
// page's h1 and dateline, never a panel (D44). `fullscreen` and `chromeViewports` match the
// site-chrome pattern stories.

const source = (...names: string[]) => showSource('read-aloud/read-aloud.fixture.tsx', ...names)

const meta = {
  title: 'Read aloud/ReadAloud',
  component: ReadAloud.Root,
  // Each story renders the fixture, which owns the real ref and its own engine; this only
  // satisfies `engine`'s and `contentRef`'s types, now that `engine` is required.
  args: { contentRef: { current: null }, engine: createFakeEngine() },
  decorators: [withReadAloudMessages],
  argTypes: {
    contentRef: {
      control: false,
      description: 'A ref to the element that is read. Optional: see `scope`.',
    },
    scope: {
      control: false,
      description:
        "A CSS selector read only while `contentRef` is not given, ahead of the `<main>` default (0154 D11, D15): `'#article'`, `'.content-body'`. `ReadAloud.Bar`'s own way to say what it reads on a site with no per-route `contentRef`.",
    },
    engine: {
      control: false,
      description:
        'Your speech engine: `kvirnSpeechEngine({ url })` from `@kvirn-ui/core`, or a fake for tests. Required: there is no default engine. `url`, `store`, `timeout` and `voices` (also on `useReadAloud`) build one instead, and are ignored once `engine` is given.',
    },
    name: {
      control: 'text',
      description:
        'Who receives the text, named by the Note and Settings parts. Pass the same value you gave `kvirnSpeechEngine`. Omit it and Note renders nothing, and Settings shows no recipient sentence.',
    },
    highlight: {
      control: 'boolean',
      description: 'Highlight the sentence being read (Custom Highlight API). Default true.',
    },
    scroll: {
      control: 'boolean',
      description: 'Scroll the sentence into view. Off under reduced motion. Default true.',
    },
    className: {
      control: 'select',
      options: [undefined, 'kv-read-aloud--icons', 'kv-read-aloud--words'],
      description:
        "Joins `kv-read-aloud`. `kv-read-aloud--icons`/`--words` choose the Bar's label mode (D9, D14, D17); the default, hybrid, needs no class.",
    },
    messages: { control: false, description: 'Per-instance text overrides.' },
    onStatusChange: { control: false },
  },
  globals: { locale: 'en', ...wideGlobals },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof ReadAloud.Root>

export default meta
type Story = StoryObj<typeof meta>

function Reader(options: FakeEngineOptions) {
  const engine = useFakeEngine(options)
  return <ArticleWithPlayer engine={engine} />
}

function FinnishReader(options: FakeEngineOptions) {
  const engine = useFakeEngine(options)
  return <ArticleWithPlayerInFinnish engine={engine} />
}

function BarReader(options: FakeEngineOptions & { labelMode?: 'icons' | 'words' | undefined }) {
  const engine = useFakeEngine(options)
  return <ArticleWithBar engine={engine} labelMode={options.labelMode} />
}

function KeyboardExample() {
  const engine = useFakeEngine({})
  return (
    <>
      <button type="button" className="kv-button">
        Before
      </button>
      <ArticleWithPlayer engine={engine} />
      <button type="button" className="kv-button">
        After
      </button>
    </>
  )
}

// The Bar (0154, "concept J"): the site-wide player, first in `PageFrame.Root`, above
// `SiteHeader`, at full page width. One `Toolbar` Tab stop (Previous, Play, Next, Stop,
// Settings), a reused `Status` as the count, and `Hide` — idle only (D13).

/**
 * The main example (D29): the Bar above the site header, static while idle, no lede and no
 * meter (D12) — the filled Play is the one action.
 */
export const Default: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader />,
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('group', { name: 'Listen to this page' })
    await expect(bar).toHaveAttribute('data-status', 'idle')
    await expect(canvas.getByRole('button', { name: 'Listen' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Previous sentence' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/**
 * The inline button row (D44, D51, D52): a resident sees `Listen to this text` beside the
 * icon-only `Listening settings` button, so voice and speed can be set
 * before the audio ever starts; pressing Listen turns Play into Pause and adds Stop next to it.
 * Previous and Next were offered and declined. Gated on `status`, not a sticky flag (D44, D47):
 * Stop returns the row to Listen and Settings again, the same as the very first idle paint; only
 * Stop comes and goes.
 */
export const Inline: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await expect(group).toHaveAttribute('data-status', 'idle')
    await expect(canvas.queryByRole('button', { name: 'Stop' })).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Listening settings' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'playing'))
    await expect(canvas.getByRole('button', { name: 'Pause' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Stop' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Listening settings' })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'idle'))
    await expect(canvas.queryByRole('button', { name: 'Stop' })).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Listening settings' })).toBeVisible()
  },
}

/** The first press's wait: Play turns busy and the status says so, past 300ms. Stop and Settings stay reachable (2.2.2). */
export const InlinePreparing: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader loadDelay={500} />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'preparing'))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Pause' })).toHaveAttribute('data-busy', ''),
    )
    await expect(canvas.getByRole('button', { name: 'Stop' })).toBeVisible()
  },
}

/** Reading: Play reads Pause, and Stop and Settings sit next to it in the row. */
export const InlinePlaying: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader speakDuration={10000} />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'playing'))
    await expect(canvas.getByRole('button', { name: 'Pause' })).toHaveAttribute('data-playing', '')
  },
}

/** Paused mid-sentence: a real pause (plan 0153 D7), resumed from where it stopped, not restarted. */
export const InlinePaused: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader speakDuration={10000} />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'playing'))
    await userEvent.click(canvas.getByRole('button', { name: 'Pause' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'paused'))
    await expect(canvas.getByRole('button', { name: 'Listen' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Stop' })).toBeVisible()
  },
}

/** The service is busy: playback stops and the Status says to try again. */
export const InlineServiceBusy: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader failWith="service-busy" />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-error', 'service-busy'))
    await expect(group).toHaveAttribute('data-status', 'idle')
    await expect(
      canvas.getByText('The listening service is busy. Press Listen to try again.'),
    ).toBeVisible()
  },
}

/** The service can't be reached at all: a network failure or an outage, told plainly. */
export const InlineServiceUnavailable: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader failWith="service-unavailable" />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-error', 'service-unavailable'))
    await expect(
      canvas.getByText(
        "The text can't be read aloud right now. Press Listen to try again, or read on.",
      ),
    ).toBeVisible()
  },
}

/** The audio loaded but failed to play: a playback failure, distinct from a service error. */
export const InlinePlaybackError: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader failPlayback />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-error', 'speech-error'))
    await expect(canvas.getByText("This browser couldn't play the audio.")).toBeVisible()
  },
}

/** A chunk the service refuses is skipped, not silent (D10): the Status says so, then reading continues. */
export const InlineSkippedPart: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader failChunkIndex={0} speakDuration={300} />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    // `partSkipped` stays shown for several seconds (the hook's own timer), so the position text
    // underneath is not what proves reading continued: the status going back to `playing` is.
    await waitFor(() => expect(canvas.getByText('One part of the text was skipped.')).toBeVisible())
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'playing'))
    await expect(canvas.getByRole('button', { name: 'Pause' })).toHaveAttribute('data-playing', '')
  },
}

/** The first press's wait: the spinner and `Getting the audio…` replace the count, past 300ms. */
export const TopBarPreparing: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader loadDelay={500} />,
  play: async ({ canvas, userEvent }) => {
    const bar = canvas.getByRole('group', { name: 'Listen to this page' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(bar).toHaveAttribute('data-status', 'preparing'))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Pause' })).toHaveAttribute('data-busy', ''),
    )
  },
}

/**
 * Reading: the toolbar's Play reads Pause, and the count says the position. Static while idle;
 * sticky only while playing (0154 D10) — a theme rule, not asserted here by computed style
 * (rule 13). The page frame's filler content (outside `contentRef`) makes the body scroll, so the
 * sticky behaviour is observable by eye: press Listen, then scroll the canvas and the bar pins to
 * the top; Stop returns it to the page's flow. This absorbs the former `BarSticky` story (D30).
 */
export const TopBarPlaying: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader speakDuration={10000} />,
  play: async ({ canvas, userEvent }) => {
    const bar = canvas.getByRole('group', { name: 'Listen to this page' })
    await expect(bar).toHaveAttribute('data-status', 'idle')
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(bar).toHaveAttribute('data-status', 'playing'))
    await expect(canvas.getByText(/^Sentence 1 of \d+$/)).toBeVisible()
  },
}

/** Paused mid-sentence: Listen resumes from the same point, never restarting the sentence (D7). */
export const TopBarPaused: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader speakDuration={10000} />,
  play: async ({ canvas, userEvent }) => {
    const bar = canvas.getByRole('group', { name: 'Listen to this page' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(bar).toHaveAttribute('data-status', 'playing'))
    await userEvent.click(canvas.getByRole('button', { name: 'Pause' }))
    await waitFor(() => expect(bar).toHaveAttribute('data-status', 'paused'))
    await expect(canvas.getByText(/^Paused at sentence 1 of \d+$/)).toBeVisible()
  },
}

/** The service is busy: the count says to try again, same text as the inline row. */
export const TopBarServiceBusy: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader failWith="service-busy" />,
  play: async ({ canvas, userEvent }) => {
    const bar = canvas.getByRole('group', { name: 'Listen to this page' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(bar).toHaveAttribute('data-error', 'service-busy'))
    await expect(
      canvas.getByText('The listening service is busy. Press Listen to try again.'),
    ).toBeVisible()
  },
}

/** The service can't be reached at all: told plainly in the count, same text as the inline row. */
export const TopBarServiceUnavailable: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader failWith="service-unavailable" />,
  play: async ({ canvas, userEvent }) => {
    const bar = canvas.getByRole('group', { name: 'Listen to this page' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(bar).toHaveAttribute('data-error', 'service-unavailable'))
    await expect(
      canvas.getByText(
        "The text can't be read aloud right now. Press Listen to try again, or read on.",
      ),
    ).toBeVisible()
  },
}

/** The audio loaded but failed to play: a playback failure, distinct from a service error. */
export const TopBarPlaybackError: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader failPlayback />,
  play: async ({ canvas, userEvent }) => {
    const bar = canvas.getByRole('group', { name: 'Listen to this page' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(bar).toHaveAttribute('data-error', 'speech-error'))
    await expect(canvas.getByText("This browser couldn't play the audio.")).toBeVisible()
  },
}

/** `ReadAloud.Settings` (D8, D21): Speed, Voice once it has loaded, and the recipient sentence. */
export const TopBarSettingsOpen: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Listening settings' }))
    await waitFor(() =>
      expect(canvas.getByRole('dialog', { name: 'Listening settings' })).toBeVisible(),
    )
    await expect(canvas.getByRole('combobox', { name: 'Speed' })).toBeVisible()
    await expect(canvas.getByText(/Listening sends this text to Kvirn/)).toBeVisible()
  },
}

/** `ReadAloud.Hide` (D13): collapses the Bar to one Play button for the rest of the page view, and moves focus there. */
export const TopBarHidden: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Hide the listening bar' }))
    await waitFor(() =>
      expect(canvas.queryByRole('button', { name: 'Previous sentence' })).toBeNull(),
    )
    await expect(canvas.getByRole('button', { name: 'Listen' })).toHaveFocus()
  },
}

/** `kv-read-aloud--icons` (D9, D14, D17): Play loses its word too, for the densest bar. */
export const TopBarIcons: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader labelMode="icons" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Listen' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Previous sentence' })).toBeVisible()
  },
}

/** `kv-read-aloud--words` (D9, D14, D17): every control keeps its word, matching the inline row's look. */
export const TopBarWords: Story = {
  parameters: source('ArticleWithBar', 'Article'),
  render: () => <BarReader labelMode="words" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Previous sentence' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Listening settings' })).toBeVisible()
  },
}

/**
 * No voice serves the page's language (a Finnish page, D9, D14): the player renders nothing at
 * all, not a dead Listen button, from the very first render. The absence is the point of this
 * story.
 */
export const InlineNoVoiceForLanguage: Story = {
  parameters: source('ArticleWithPlayerInFinnish', 'FinnishArticle'),
  render: () => <FinnishReader />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('group')).toBeNull()
    await expect(canvas.queryByRole('button', { name: 'Listen' })).toBeNull()
  },
}

/**
 * The fixture the keyboard tests drive: a button before, the player, and a button after. Try the
 * keys in the Keyboard section above: Tab and Shift+Tab move between the controls, Enter and
 * Space activate Play, and Escape stops reading. Named `Keyboard` literally
 * (`tooling/keyboard-docs` looks for this exact export).
 */
export const Keyboard: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <KeyboardExample />,
}

/** Right to left, in English: the composition and the reading order stay the same shape mirrored. */
export const RTL: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => <Reader />,
}

/** Forced colours: the boundary and the focus ring come from the system palette, not a brand colour. */
export const ForcedColors: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  globals: { forcedColors: 'active', locale: 'en', ...wideGlobals },
  render: () => <Reader />,
}
