import type { Meta, StoryObj } from '@storybook/react-vite'
import { expectTextOnSurface, TextOnSurfacePage } from './colors-matrix.tsx'
import { expectPalette, PalettePage } from './colors-palette.tsx'
import { expectSemanticTokens, SemanticPage } from './colors-semantic.tsx'
import { expectGlobalsThemeApplied } from './foundation-helpers.tsx'

// Foundation/Colors (docs/design/foundations-and-prose.md §6.6): the two tiers of colour and
// how they measure, one story each, on one Docs page. Each page lives in its own module.

const meta = {
  title: 'Foundation/Colors',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * The raw role scales, with white and black text measured on every step, in the toolbar's
 * theme: each storybook Vitest project checks one (ADR-0023).
 */
export const Palette: Story = {
  render: () => <PalettePage />,
  play: async ({ canvasElement, globals }) => {
    await expectGlobalsThemeApplied(canvasElement, globals)
    await expectPalette(canvasElement)
  },
}

/** Which palette step each semantic token uses, in all four themes, the current one named. */
export const SemanticTokens: Story = {
  name: 'Semantic tokens',
  render: () => <SemanticPage />,
  play: async ({ canvasElement, globals }) => {
    await expectSemanticTokens(
      canvasElement,
      await expectGlobalsThemeApplied(canvasElement, globals),
    )
  },
}

/** Every text token on every background, measured live in the toolbar's theme. */
export const TextOnSurface: Story = {
  name: 'Text on surface',
  render: () => <TextOnSurfacePage />,
  play: async ({ canvasElement, globals }) => {
    await expectTextOnSurface(
      canvasElement,
      await expectGlobalsThemeApplied(canvasElement, globals),
    )
  },
}
