import { kvirnbyFloorPlan } from '@kvirn-ui/patterns/fixtures'
import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/content-and-media/figure/figure.a11y.md?raw'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Content and media/Figure (docs/design/storybook-patterns-t5.md S13).
// Story-only: Prose already styles a native `figure`, so it has no pattern.

const description = `A picture that adds information, with a caption. Write a native \`figure\` with an \`img\` and a \`figcaption\` inside a \`kv-prose\` block: no class, no component. The \`alt\` says what the picture shows that matters here, and the caption holds the credit and source; they never repeat each other. A decorative picture has \`alt=""\`, no \`figure\` and no caption. A map, plan or chart gets a short \`alt\` and its facts in the text next to it, never only in \`title\` (1.1.1, 1.4.5).

## Parts and gaps

Parts used: native \`figure\`, \`img\` and \`figcaption\` in \`kv-prose\`. No gap.
`

const meta = {
  title: 'Patterns/Content and media/Figure',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Informative: the `alt` says what the plan shows. */
export const Informative: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <p>The preschool has two wings with the entrance between them.</p>
        <figure>
          <img
            src={kvirnbyFloorPlan}
            alt="Floor plan of Hillside preschool: four rooms, two on each side of the central hall, with the entrance at the bottom."
          />
          <figcaption>Hillside preschool, ground floor. Drawing: Kvirnby municipality.</figcaption>
        </figure>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('figure')).toBeVisible()
    await expect(
      canvas.getByRole('img', { name: /Floor plan of Hillside preschool/ }),
    ).toBeVisible()
    await expect(canvas.getByText('Drawing: Kvirnby municipality', { exact: false })).toBeVisible()
  },
}

/** Decorative: `alt=""`, no `figure`, no caption. */
export const Decorative: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-prose">
        <p>The garden is open every day.</p>
        <img src={kvirnbyFloorPlan} alt="" />
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('figure')).toBeNull()
    await expect(canvasElement.querySelector('img')?.getAttribute('alt')).toBe('')
  },
}

/** 320px: the picture scales to the column; nothing scrolls sideways. */
export const Narrow: Story = {
  ...Informative,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the figure keeps the reading measure. */
export const Wide: Story = {
  ...Informative,
  globals: { ...wideGlobals },
}

/** Right to left: the caption starts at the right. */
export const RTL: Story = {
  ...Informative,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the picture and caption stay visible. */
export const ForcedColors: Story = {
  ...Informative,
  globals: { forcedColors: 'active' },
}
