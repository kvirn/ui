import { kvirnbyCaptions, kvirnbyHills } from '@kvirn-ui/patterns/fixtures'
import { en } from '@kvirn-ui/i18n/en'
import { Disclosure, Heading, KvirnProvider, Link, List } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/content-and-media/video/video.a11y.md?raw'
import { expect, userEvent } from 'storybook/test'
import {
  expectAnimationsSettled,
  expectNoHorizontalOverflow,
} from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Content and media/Video (docs/design/storybook-patterns-t5.md S16).
// Recipe: a native `video`, a `Disclosure` and links; no package code. The repo holds no video
// file (Q14): the story shows the poster, the captions track and the transcript.

const description = `Watch, or read instead. A native \`<video controls preload="none" poster>\` inside a \`kv-prose\` block (it is already styled), self-hosted: never an iframe or a third-party player (rule 7, R8). Every video has a \`<track kind="captions" srclang default>\` per language (1.2.2) and a transcript in a [Disclosure](?path=/docs/components-disclosure--docs) right below it, so the words and the visual facts can be read instead (1.2.1, 1.2.3). Links to an audio-described or sign-language version sit after the transcript when they exist (1.2.5). No \`autoplay\`, no \`loop\`, no \`muted\` trick (1.4.2, 2.2.2). Keep the video short and give it a heading that says what it is. The story has no video file, so the native controls show but nothing plays; the poster, the captions track and the transcript are the recipe. Native control keys differ per browser: AT verification is \`pending\`.

## Parts and gaps

Parts used: native \`video\` and \`track\`, \`Heading\`, \`Disclosure.Root\`, \`Disclosure.Trigger\`, \`Disclosure.Panel\`, \`Link.Root\`, \`List\`. No gap.
`

const meta = {
  title: 'Patterns/Content and media/Video',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Transcript() {
  return (
    <Disclosure.Root>
      <Disclosure.Trigger>Read the transcript</Disclosure.Trigger>
      <Disclosure.Panel>
        <div className="kv-prose">
          <p>Welcome to Hillside preschool.</p>
          <p>[Children laughing] This is the hall, where every morning starts.</p>
          <p>Ask us for a visit on any weekday.</p>
        </div>
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}

function VideoPlayer() {
  return (
    <video controls preload="none" poster={kvirnbyHills} aria-label="Visit Hillside preschool">
      <track kind="captions" srcLang="en" label="English" src={kvirnbyCaptions} default />
    </video>
  )
}

/** The video with its transcript, closed. */
export const WithTranscript: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Visit Hillside preschool
        </Heading>
        <VideoPlayer />
        <Transcript />
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    const video = canvasElement.querySelector('video')
    await expect(video).not.toBeNull()
    await expect(video?.hasAttribute('autoplay')).toBe(false)
    await expect(video?.hasAttribute('loop')).toBe(false)
    await expect(video?.querySelector('track[kind="captions"]')).not.toBeNull()
    const trigger = canvas.getByRole('button', { name: 'Read the transcript' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expectAnimationsSettled()
    await expect(canvas.getByText('Ask us for a visit on any weekday.')).toBeVisible()
  },
}

/** With links to the described and the sign-language versions. */
export const WithOtherVersions: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h2" size="heading-3">
          Visit Hillside preschool
        </Heading>
        <VideoPlayer />
        <Transcript />
        <p>Other versions of this video:</p>
        <List.Root>
          <List.Item>
            <Link.Root href="#described">Audio-described version of the preschool video</Link.Root>
          </List.Item>
          <List.Item>
            <Link.Root href="#sign">Swedish Sign Language version of the preschool video</Link.Root>
          </List.Item>
        </List.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
    await expect(
      canvas.getByRole('link', { name: 'Audio-described version of the preschool video' }),
    ).toBeVisible()
  },
}

/** 320px: the video scales to the column; nothing scrolls sideways. */
export const Narrow: Story = {
  ...WithOtherVersions,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the video keeps the reading measure. */
export const Wide: Story = {
  ...WithTranscript,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab to the transcript button, Enter or Space opens it, Tab goes on to the links. */
export const Keyboard: Story = { ...WithOtherVersions }

/** Right to left. */
export const RTL: Story = {
  ...WithTranscript,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the transcript button and the links stay visible. */
export const ForcedColors: Story = {
  ...WithTranscript,
  globals: { forcedColors: 'active' },
}
