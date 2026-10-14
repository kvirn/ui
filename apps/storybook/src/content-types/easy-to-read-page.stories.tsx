import { PageFrame } from '@kvirn-ui/patterns'
import { EasyToReadPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/easy-to-read-page/easy-to-read-page.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Easy-to-read page: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S14).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `A page in easy-to-read language (lättläst, selkokieli, lettlest) at the reading width and in large text (\`kv-prose kv-prose--large\`): short sentences, one idea in each, \`h2\` headings written as questions and lists for steps. Nothing is hidden or dense, so there is no Accordion, Table or contents list. The text is an English example: easy-to-read text is written in the resident language and tested with people from the target group, which a component cannot do for you.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; nothing is sticky, so reading, focus and visual order agree. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Easy-to-read page',
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

/** The page, ending in a contact card. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <EasyToReadPage />,
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
