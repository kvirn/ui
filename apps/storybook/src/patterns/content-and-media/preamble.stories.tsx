// kv-lang-ok-file: a long Finnish word, a hard case for wrapping
import { en } from '@kvirn-ui/i18n/en'
import { Heading, KvirnProvider } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/content-and-media/preamble/preamble.a11y.md?raw'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Content and media/Preamble (docs/design/storybook-patterns-t5.md S13).
// Story-only: a paragraph with the `kv-lead` class is shipped CSS, so it has no pattern.

const description = `Says what the page helps with, before the details: one paragraph straight after the \`h1\`. Write it as \`<p className="kv-lead">\` inside a \`kv-prose\` block, or use \`PageHeader.Lead\` when the page has a [PageHeader](?path=/docs/patterns-site-chrome-page-header--docs). It is not a landmark and not a component of its own: copy the story's code and replace the text. Keep it to one to three sentences; a long compound word wraps and never truncates (1.4.4, 1.4.10).

## Parts and gaps

Parts used: \`Heading\`, the \`kv-prose\` and \`kv-lead\` classes. No gap.
`

const meta = {
  title: 'Patterns/Content and media/Preamble',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** One sentence. */
export const OneSentence: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h1" size="heading-1">
          Preschool
        </Heading>
        <p className="kv-lead">Find out how to apply for a place and what it costs.</p>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1, name: 'Preschool' })).toBeVisible()
    await expect(canvas.getByText('Find out how to apply', { exact: false })).toBeVisible()
  },
}

/** Three sentences: the most it should say. */
export const ThreeSentences: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <Heading as="h1" size="heading-1">
          Preschool
        </Heading>
        <p className="kv-lead">
          Every child from the age of one has the right to a place in preschool. Here you can see
          how to apply, what it costs and how the queue works. You apply on My pages.
        </p>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('Every child from the age of one', { exact: false }),
    ).toBeVisible()
  },
}

/** A long Finnish compound word wraps. */
export const LongFinnishCompound: Story = {
  render: () => (
    <KvirnProvider locale="fi" messages={en}>
      <div lang="fi" className="kv-prose">
        <Heading as="h1" size="heading-1">
          Varhaiskasvatus
        </Heading>
        <p className="kv-lead">
          Varhaiskasvatuksenerityisopettajapalvelut auttavat perhettä kaikissa lapsen
          varhaiskasvatukseen liittyvissä kysymyksissä.
        </p>
      </div>
    </KvirnProvider>
  ),
  globals: { ...narrowGlobals, locale: 'fi' },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 320px: the text wraps; nothing scrolls sideways. */
export const Narrow: Story = {
  ...ThreeSentences,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the lead keeps its reading measure. */
export const Wide: Story = {
  ...ThreeSentences,
  globals: { ...wideGlobals },
}

/** Right to left: the paragraph starts at the right. */
export const RTL: Story = {
  ...ThreeSentences,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the text is `CanvasText` on `Canvas`. */
export const ForcedColors: Story = {
  ...ThreeSentences,
  globals: { forcedColors: 'active' },
}
