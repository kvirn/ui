import { ServiceLink } from '@kvirn-ui/patterns'
import { en } from '@kvirn-ui/i18n/en'
import { KvirnProvider } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/navigation-and-promotion/service-link/service-link.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Navigation and promotion/Service link (docs/design/storybook-patterns.md section 6).

const description = `The one link that starts an e-service. It is a link, never a button, in the service look with an arrow that mirrors in right-to-left. Put one in a view.

While the service is closed the link is not drawn: a sentence takes its place, "The e-service is closed 1–3 November.", with what to do meanwhile under it. Nothing is dimmed or disabled, so a screen reader user and a keyboard user meet the same words.

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`ServiceLink.Root\` | \`<div>\` | \`<div>\` props |
| \`ServiceLink.Link\` | \`<a href>\` in a \`<p>\` | \`href\`, \`as\` (a router link). The text starts with a verb and names the service |
| \`ServiceLink.Closed\` | \`<div>\` with \`<p>\` | Children: the sentence, as written |
| \`ServiceLink.Alternative\` | \`<div>\` | Other ways to apply, or what to do meanwhile |

## Parts and gaps

Parts used: \`Link\` (\`kv-link--service\`), \`Icon\`. No gap.
`

const meta = {
  title: 'Patterns/Navigation and promotion/Service link',
  component: ServiceLink.Root,
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof ServiceLink.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The e-service is open: the link, then another way to apply. */
export const Default: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <ServiceLink.Root>
          <ServiceLink.Link href="#apply">Apply for a preschool place</ServiceLink.Link>
          <ServiceLink.Alternative>
            <p>
              Other ways to apply: <a href="#form">download the form</a> and hand it in to the
              preschool office.
            </p>
          </ServiceLink.Alternative>
        </ServiceLink.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Apply for a preschool place' })).toHaveAttribute(
      'href',
      '#apply',
    )
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** Closed: a sentence and no link to the service, and nothing dimmed. */
export const Closed: Story = {
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en">
        <ServiceLink.Root>
          <ServiceLink.Closed>The e-service is closed 1–3 November.</ServiceLink.Closed>
          <ServiceLink.Alternative>
            <p>Call the contact centre if you need help.</p>
          </ServiceLink.Alternative>
        </ServiceLink.Root>
      </div>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('The e-service is closed 1–3 November.')).toBeVisible()
    await expect(canvas.queryByRole('link')).toBeNull()
  },
}

/** 320px: the link is the full width and nothing scrolls sideways. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem: the link is as wide as its text. */
export const Wide: Story = {
  ...Default,
  globals: { ...wideGlobals },
}

/** Try the keys (see Keyboard above): Tab moves to the link, then to the alternative. */
export const Keyboard: Story = { ...Default }

/** Right to left: the arrow mirrors. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the link is `LinkText` and the arrow is drawn. */
export const ForcedColors: Story = {
  ...Default,
  globals: { forcedColors: 'active' },
}
