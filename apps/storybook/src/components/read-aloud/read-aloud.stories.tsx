import { ReadAloud } from '@kvirn-ui/read-aloud'
import contract from '../../../../../packages/read-aloud/src/read-aloud.a11y.md?raw'
import guide from '../../../../../packages/read-aloud/src/read-aloud.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { ArticleWithPlayer, useFakeEngine, withReadAloudMessages } from './read-aloud.fixture.tsx'
import type { FakeEngineOptions } from './read-aloud.fixture.tsx'

// Components/ReadAloud: a player that reads a region aloud, one sentence at a time, on the
// browser's speechSynthesis (contract: read-aloud.a11y.md; design spec docs/design/read-aloud.md).
// Every story uses a fake engine from the fixture, so nothing is ever spoken. A story that shows a
// state reaches it in `play`, as a person would: nothing starts by itself.

const source = (...names: string[]) => showSource('read-aloud/read-aloud.fixture.tsx', ...names)

const meta = {
  title: 'Components/Data and behaviour/ReadAloud',
  component: ReadAloud.Root,
  // Each story renders the fixture, which owns the real ref; this only satisfies the type.
  args: { contentRef: { current: null } },
  decorators: [withReadAloudMessages],
  argTypes: {
    contentRef: {
      control: false,
      description: 'A ref to the element that is read. Required.',
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

/** Listen reads the whole article, a sentence at a time, and the Status says where it is. Nothing starts by itself. */
export const Default: Story = {
  parameters: source('ArticleWithPlayer', 'Article'),
  render: () => <Reader />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Listen to this text' })
    await expect(group).toHaveAttribute('data-status', 'idle')
    await expect(canvas.getByRole('combobox', { name: 'Voice' })).toBeVisible()
    const listen = canvas.getByRole('button', { name: 'Listen' })
    await userEvent.click(listen)
    await expect(group).toHaveAttribute('data-status', 'playing')
    await expect(canvas.getByRole('button', { name: 'Pause' })).toHaveFocus()
    await expect(canvas.getByText(/^Sentence 1 of \d+$/)).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
    await expect(group).toHaveAttribute('data-status', 'idle')
  },
}
