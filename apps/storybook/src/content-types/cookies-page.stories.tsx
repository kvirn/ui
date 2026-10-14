import { PageFrame } from '@kvirn-ui/patterns'
import { CookiesPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/cookies-page/cookies-page.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Cookies page: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S14).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `A cookies page for a site that sets none. It says so, says what your browser remembers when you choose a display setting and links to where you change it. There is no consent form, because there is nothing to consent to: adding one for trackers that do not exist would mislead. A site that does set cookies needs its own page and its own legal review.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; nothing is sticky, so reading, focus and visual order agree. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Cookies page',
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

/** The page for a site with no cookies and no tracking. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <CookiesPage />,
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

/** Right to left: DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
