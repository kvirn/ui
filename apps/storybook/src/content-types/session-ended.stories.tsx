import { PageFrame } from '@kvirn-ui/patterns'
import { SessionEnded } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/session-ended/session-ended.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Session ended: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S12).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `Where the resident lands when the session has ended, after the [Timeout warning](?path=/docs/patterns-my-pages-timeout-warning--docs) ran out: \`h1\` "You have been signed out", whether the answers were saved, and a [Service link](?path=/docs/patterns-navigation-and-promotion-service-link--docs) to sign in again. There is no breadcrumb. The page takes focus on the \`h1\` only if your router moves it on navigation; nothing is announced on load.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\`; the skip link is first and targets \`main\`; nothing is sticky. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Session ended',
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

/** The answers are saved: sign in again and carry on. */
export const AnswersSaved: Story = {
  globals: { ...wideGlobals },
  render: () => <SessionEnded />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByText(/Your answers are saved/)).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Sign in again' })).toBeVisible()
  },
}

/** The answers were not saved: said plainly, with what to check. */
export const AnswersNotSaved: Story = {
  globals: { ...wideGlobals },
  render: () => <SessionEnded answers="not-saved" />,
  play: async ({ canvas, canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByText(/were not saved/)).toBeVisible()
  },
}

/** 320px: no sideways scroll. */
export const Narrow: Story = {
  ...AnswersSaved,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the page mirrors; DOM order is unchanged. */
export const RTL: Story = {
  ...AnswersSaved,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
