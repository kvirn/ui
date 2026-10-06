import { ReadAloud } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/read-aloud/read-aloud.a11y.md?raw'
import guide from '../../../../../packages/react/src/read-aloud/read-aloud.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ArticleWithPlayer,
  SpeechDiagnostics,
  swedishVoice,
  useFakeEngine,
  withReadAloudMessages,
} from './read-aloud.fixture.tsx'
import type { FakeEngineOptions } from './read-aloud.fixture.tsx'

// Components/ReadAloud: a player that reads a region aloud, one sentence at a time, on the
// browser's speechSynthesis (contract: read-aloud.a11y.md; design spec docs/design/read-aloud.md).
// Every story uses a fake engine from the fixture, so nothing is ever spoken. A story that shows a
// state reaches it in `play`, as a person would: nothing starts by itself.

const source = (...names: string[]) => showSource('read-aloud/read-aloud.fixture.tsx', ...names)

const meta = {
  title: 'Components/ReadAloud',
  component: ReadAloud.Root,
  // Each story renders the fixture, which owns the real ref; this only satisfies the type.
  args: { contentRef: { current: null } },
  decorators: [withReadAloudMessages],
  argTypes: {
    contentRef: {
      control: false,
      description: 'A ref to the element that is read. Required.',
    },
    lang: {
      control: 'text',
      description: 'The language of the text. Else the closest `[lang]` of the content.',
    },
    engine: {
      control: false,
      description: 'Advanced, unstable: your own speech engine. Default: `speechSynthesis`.',
    },
    allowRemoteVoices: {
      control: 'boolean',
      description: 'Also offer voices that may send the text to a remote service. Default false.',
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
    render: { control: false },
  },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: usageGuide(guide) } },
  },
} satisfies Meta<typeof ReadAloud.Root>

export default meta
type Story = StoryObj<typeof meta>

function Reader({ lang, ...options }: FakeEngineOptions & { lang?: string }) {
  const engine = useFakeEngine(options)
  return <ArticleWithPlayer engine={engine} lang={lang} />
}

/** Listen reads the whole article, a sentence at a time, and the Status says where it is. Nothing starts by itself. */
export const Default: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Lyssna på texten' })
    await expect(group).toHaveAttribute('data-status', 'idle')
    await expect(canvas.getByRole('combobox', { name: 'Röst' })).toBeVisible()
    const listen = canvas.getByRole('button', { name: 'Lyssna' })
    await userEvent.click(listen)
    await expect(group).toHaveAttribute('data-status', 'playing')
    await expect(canvas.getByRole('button', { name: 'Pausa' })).toHaveFocus()
    await expect(canvas.getByText(/^Mening 1 av \d+$/)).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Stoppa' }))
    await expect(group).toHaveAttribute('data-status', 'idle')
  },
}

/** Reading: Play becomes Pause, and the sentence being read is highlighted. */
export const Playing: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader sentenceDuration={null} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Lyssna' }))
    await expect(canvas.getByRole('group')).toHaveAttribute('data-status', 'playing')
    await expect(canvas.getByRole('button', { name: 'Pausa' })).toHaveAttribute('data-playing')
  },
}

/** Paused: Play offers Listen again and the Status keeps the place. */
export const Paused: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader sentenceDuration={null} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Lyssna' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Pausa' }))
    await expect(canvas.getByRole('group')).toHaveAttribute('data-status', 'paused')
    await expect(canvas.getByText(/^Pausad vid mening 1 av \d+$/)).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Lyssna' })).toBeVisible()
  },
}

/** A selection in the text is captured: Play reads it, and a pointer selection also shows a trigger below it. */
export const WithSelection: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader />,
  play: async ({ canvas }) => {
    const paragraph = canvas.getByText(/^The case officer reviews/)
    const textNode = paragraph.firstChild
    if (textNode === null) {
      throw new Error('the paragraph has no text')
    }
    document.getSelection()?.setBaseAndExtent(textNode, 0, textNode, 40)
    document.dispatchEvent(new Event('pointerup', { bubbles: true }))
    // Play and the trigger carry the same name.
    await waitFor(() =>
      expect(
        canvas.getAllByRole('button', { name: 'Lyssna på markerad text', hidden: true }),
      ).toHaveLength(2),
    )
  },
}

/** No voice for the language: nothing is read, and the Status says so (announced once, politely). */
export const NoVoice: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader voices={[swedishVoice]} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Lyssna' }))
    await expect(await canvas.findByText(/ingen röst/)).toBeVisible()
    await expect(canvas.queryByRole('combobox', { name: 'Röst' })).toBeNull()
  },
}

/** No speech support: only the Status is left, and nothing is focusable. */
export const Unsupported: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader isSupported={false} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group')).toHaveAttribute('data-status', 'unsupported')
    await expect(canvas.queryByRole('button')).toBeNull()
    await expect(canvas.queryByRole('combobox')).toBeNull()
  },
}

/** One voice for the language: there is nothing to choose, so Voice isn't rendered. */
export const OneVoice: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => (
    <Reader
      voices={[{ voiceURI: 'fake-en-one', name: 'English One', lang: 'en-GB', localService: true }]}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Hastighet' })).toBeVisible()
    await expect(canvas.queryByRole('combobox', { name: 'Röst' })).toBeNull()
  },
}

/** Tab walks the controls in order and Enter or Space reads. Focus stays on Play, and Escape stops. */
export const Keyboard: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader sentenceDuration={null} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Lyssna' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Föregående mening' })).toHaveFocus()
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    await expect(canvas.getByRole('combobox', { name: 'Hastighet' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await userEvent.keyboard('{Enter}')
    const pause = canvas.getByRole('button', { name: 'Pausa' })
    await expect(pause).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect(canvas.getByRole('group')).toHaveAttribute('data-status', 'idle')
    await expect(canvas.getByRole('button', { name: 'Lyssna' })).toHaveFocus()
  },
}

/** Right to left, in English: the controls and the Status follow the inline direction. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Listen to this text' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Listen' })).toBeVisible()
  },
}

/** Forced colours: native buttons and selects, so the system colours and focus ring apply. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader sentenceDuration={null} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Lyssna' }))
  },
}

/** At 320 CSS px the controls wrap and nothing overflows (1.4.10). */
export const Narrow: Story = {
  globals: { locale: 'fi' },
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => (
    <div className="kv-story-narrow" data-testid="narrow">
      <Reader />
    </div>
  ),
  play: async ({ canvas }) => {
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/**
 * For listening by hand: the only story on the real `speechSynthesis`. Every other story uses a
 * silent fake engine. Nothing starts by itself, so headless runs just show the no-voice state.
 * If your browser has no local voice, see the Voices section of the ReadAloud docs.
 */
export const RealVoices: Story = {
  args: { allowRemoteVoices: false },
  argTypes: {
    allowRemoteVoices: {
      control: 'boolean',
      description:
        'Chrome/Edge network voices send the text to Google/Microsoft; the docs site and the default keep this off.',
    },
  },
  parameters: source('ArticleWithPlayer', 'Article'),
  render: ({ allowRemoteVoices }) => (
    <>
      <ArticleWithPlayer allowRemoteVoices={allowRemoteVoices} />
      <SpeechDiagnostics />
    </>
  ),
}
