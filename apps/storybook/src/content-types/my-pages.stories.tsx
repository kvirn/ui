import { PageFrame } from '@kvirn-ui/patterns'
import { MyPages } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/my-pages/my-pages.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/My pages: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S12).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `The resident's case list, behind sign-in: \`h1\` "My pages", \`h2\` "Your cases", the count, one [Case card](?path=/docs/patterns-my-pages-case-card--docs) per case in one column, and [Pagination](?path=/docs/components-navigation-pagination--docs). With no cases it shows an empty state with a Service link; while the list is fetched it shows a [Progress](?path=/docs/components-status-progress--docs) label, announced once.

The cards stop at \`h3\`. The case that waits for the resident can be lifted to the top, and says so in words ("Action needed:"), not by colour. The sign-in itself is the [Login entry](?path=/docs/patterns-sign-in-and-subscribe-login-entry--docs). The sample cases are fictional.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; nothing is sticky and nothing is reordered with CSS. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/My pages',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  decorators: [withShell],
  parameters: {
    layout: 'fullscreen',
    shell: { header: 'kvirnby' },
    docs: { description: { component: description }, source: { code: source } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** Several cases, the most recently changed first. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <MyPages />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('heading', { level: 2, name: 'Your cases' })).toBeVisible()
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(5)
  },
}

/** The case that needs something from the resident comes first. */
export const ActionNeededFirst: Story = {
  globals: { ...wideGlobals },
  render: () => <MyPages state="action-needed-first" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvasElement.querySelector('li h3 a')).toHaveTextContent(
      'Application for a preschool place',
    )
    await expect(canvas.getByText('Action needed:')).toBeVisible()
  },
}

/** No cases yet: what appears here, and a Service link. */
export const NoCases: Story = {
  globals: { ...wideGlobals },
  render: () => <MyPages state="no-cases" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'You have no cases yet' }),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Find an e-service' })).toBeVisible()
  },
}

/** Fetching the cases: a Progress label, not a spinner alone. It shows at once. */
export const Loading: Story = {
  globals: { ...wideGlobals },
  render: () => <MyPages state="loading" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: one column, no sideways scroll. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the page mirrors; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
