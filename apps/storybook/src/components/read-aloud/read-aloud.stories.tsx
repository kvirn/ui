import { ReadAloud } from '@kvirn-ui/read-aloud'
import contract from '../../../../../packages/read-aloud/src/read-aloud.a11y.md?raw'
import guide from '../../../../../packages/read-aloud/src/read-aloud.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import {
  ArticleWithPlayer,
  ArticleWithPlayerInFinnish,
  ArticleWithVoice,
  createFakeEngine,
  useFakeEngine,
  withReadAloudMessages,
} from './read-aloud.fixture.tsx'
import type { FakeEngineOptions } from './read-aloud.fixture.tsx'

// Components/ReadAloud: a player that reads a region aloud, one sentence at a time, on the Kvirn
// voice service (contract: read-aloud.a11y.md; design spec docs/design/read-aloud.md). Every
// story uses a fake engine from the fixture, so nothing is ever spoken and nothing ever reaches
// the network (plan 0153 D6). A story that shows a state reaches it in `play`, as a person would:
// nothing starts by itself.

const source = (...names: string[]) => showSource('read-aloud/read-aloud.fixture.tsx', ...names)

const meta = {
  title: 'Components/Data and behaviour/ReadAloud',
  component: ReadAloud.Root,
  // Each story renders the fixture, which owns the real ref and its own engine; this only
  // satisfies `engine`'s and `contentRef`'s types, now that `engine` is required.
  args: { contentRef: { current: null }, engine: createFakeEngine() },
  decorators: [withReadAloudMessages],
  argTypes: {
    contentRef: {
      control: false,
      description: 'A ref to the element that is read. Required.',
    },
    engine: {
      control: false,
      description:
        'Your speech engine: `kvirnSpeechEngine({ url })` from `@kvirn-ui/core`, or a fake for tests. Required: there is no default engine.',
    },
    name: {
      control: 'text',
      description:
        'Who receives the text, named by the Note part. Pass the same value you gave `kvirnSpeechEngine`. Omit it and Note renders nothing.',
    },
    highlight: {
      control: 'boolean',
      description: 'Highlight the sentence being read (Custom Highlight API). Default true.',
    },
    scroll: {
      control: 'boolean',
      description: 'Scroll the sentence into view. Off under reduced motion. Default true.',
    },
    messages: { control: false, description: 'Per-instance text overrides.' },
    onStatusChange: { control: false },
  },
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof ReadAloud.Root>

export default meta
type Story = StoryObj<typeof meta>

function Reader(options: FakeEngineOptions) {
  const engine = useFakeEngine(options)
  return <ArticleWithPlayer engine={engine} />
}

function VoiceReader(options: FakeEngineOptions) {
  const engine = useFakeEngine(options)
  return <ArticleWithVoice engine={engine} />
}

function FinnishReader(options: FakeEngineOptions) {
  const engine = useFakeEngine(options)
  return <ArticleWithPlayerInFinnish engine={engine} />
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

/**
 * The recommended composition (design spec §5): Play, Previous, Next, Stop, Rate, Status and
 * Note. Listen reads the whole article, a sentence at a time, and the Status says where it is.
 * Nothing starts by itself.
 */
export const Default: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await expect(group).toHaveAttribute('data-status', 'idle')
    await expect(canvas.getByText(/Listening sends this text to Kvirn/)).toBeVisible()
    const listen = canvas.getByRole('button', { name: 'Listen' })
    await userEvent.click(listen)
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'playing'))
    await expect(canvas.getByRole('button', { name: 'Pause' })).toHaveFocus()
    await expect(canvas.getByText(/^Sentence 1 of \d+$/)).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
    await expect(group).toHaveAttribute('data-status', 'idle')
  },
}

/**
 * `Voice` added to the composition, as a separate, clearly-labelled example: it is not in the
 * recommended composition (D8), because the list only arrives after the first press and only
 * English has two voices today.
 */
export const Voice: Story = {
  parameters: source('ArticleWithVoice', 'Article'),
  render: () => <VoiceReader />,
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Voice' })).toBeVisible())
  },
}

/** The first press's wait: Play turns busy and the status says so, past 300ms. Pause and Stop stay reachable (2.2.2). */
export const Preparing: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader loadDelay={500} />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'preparing'))
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Pause' })).toHaveAttribute('data-busy', ''),
    )
    await expect(canvas.getByRole('button', { name: 'Previous sentence' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/** Reading: the current sentence is tracked in Status, and Play reads Pause. */
export const Playing: Story = {
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
export const Paused: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader speakDuration={10000} />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await userEvent.click(canvas.getByRole('button', { name: 'Listen' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'playing'))
    await userEvent.click(canvas.getByRole('button', { name: 'Pause' }))
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'paused'))
    await expect(canvas.getByRole('button', { name: 'Listen' })).toBeVisible()
    await expect(canvas.getByText(/^Paused at sentence 1 of \d+$/)).toBeVisible()
  },
}

/** The service is busy: playback stops and the Status says to try again. */
export const ServiceBusy: Story = {
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
export const ServiceUnavailable: Story = {
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
export const PlaybackError: Story = {
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
export const SkippedPart: Story = {
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

/**
 * No voice serves the page's language (a Finnish page, D9, D14): the player renders nothing at
 * all, not a dead Listen button, from the very first render. The absence is the point of this
 * story.
 */
export const NoVoiceForLanguage: Story = {
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
 * Space activate Play, and Escape stops reading.
 */
export const Keyboard: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <KeyboardExample />,
}

/** Right to left, in English: the composition and the reading order stay the same shape mirrored. */
export const RTL: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <Reader />,
}

/** Forced colours: the boundary and the focus ring come from the system palette, not a brand colour. */
export const ForcedColors: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  globals: { forcedColors: 'active' },
  render: () => <Reader />,
}
