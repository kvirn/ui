import { PageFrame } from '@kvirn-ui/patterns'
import { CaseDetail } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/case-detail/case-detail.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Case detail: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S12).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `One case: the breadcrumb (My pages, then the case), \`h1\` with the status in a Badge and the case number in a [Definition list](?path=/docs/components-content-definition-list--docs), \`h2\` "What happens next", \`h2\` "Documents" (a plain list of links) and the case officer as a contact card. When the resident must act, "What happens next" starts "Action needed:" and ends in a [Service link](?path=/docs/patterns-navigation-and-promotion-service-link--docs) to answer.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb is before \`main\` and named; nothing is sticky. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Case detail',
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

/** A case being handled: what happens next, documents and the case officer. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <CaseDetail />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('heading', { level: 2, name: 'What happens next' })).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 2, name: 'Documents' })).toBeVisible()
  },
}

/** The resident must answer: said in words, with a Service link. */
export const ActionNeeded: Story = {
  globals: { ...wideGlobals },
  render: () => <CaseDetail state="action-needed" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByText('Action needed:')).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Answer the offer' })).toBeVisible()
  },
}

/** 320px: one column, no sideways scroll. */
export const Narrow: Story = {
  ...ActionNeeded,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the page mirrors; DOM order is unchanged. */
export const RTL: Story = {
  ...ActionNeeded,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
