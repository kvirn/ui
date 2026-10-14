import { PageFrame } from '@kvirn-ui/patterns'
import { PrivacyPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/privacy-page/privacy-page.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Privacy page: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S14).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `A privacy notice at the reading width: the \`h1\`, a preamble, a contents list and \`h2\` sections. What is collected is a [Table](?path=/docs/components-content-table--docs) of purpose, legal basis and retention, the rights are a [List](?path=/docs/components-content-list--docs) and the data protection officer is a contact card. The text is an example: the section on the supervisory authority is marked \`TODO(legal-verify)\` and an adopter has its own text checked by a lawyer.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; nothing is sticky, so reading, focus and visual order agree. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Privacy page',
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

/** The whole notice, with the page tools last. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <PrivacyPage />,
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
