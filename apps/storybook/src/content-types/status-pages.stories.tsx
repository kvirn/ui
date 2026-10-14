import { PageFrame } from '@kvirn-ui/patterns'
import { StatusPages } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/status-pages/status-pages.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Status pages: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S15).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `The pages a visitor lands on when something is missing, broken or closed: the 404, the 500 and a service that is closed until a set time. There is no breadcrumb, and \`main\` is one narrow column (\`Container size="form"\`). Each says what happened in plain words, whose fault it is, and what to do next.

The 404 has a search with a visible label. The header has one too, so the two \`search\` landmarks are named differently ("Search the site" and "Search for a page"). The 500 has no search and no script: it must render when the data layer fails, so it holds only text and one phone link. The unavailable page names the time the service opens again in a \`<time>\`, and gives other ways to do the task.

Written as literal JSX from [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs), [Site search](?path=/docs/patterns-site-chrome-site-search--docs), \`Heading\`, \`List\` and \`Link\`.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; nothing is sticky. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Status pages',
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

/** 404: what to do, a search with a visible label, and other places to go. */
export const NotFound: Story = {
  globals: { ...wideGlobals },
  render: () => <StatusPages status="not-found" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvasElement.querySelectorAll('search')).toHaveLength(2)
    await expect(canvas.getByRole('searchbox', { name: 'Search for a page' })).toBeVisible()
    await expect(canvas.getByRole('searchbox', { name: 'Search the site' })).toBeInTheDocument()
  },
}

/** 500: the contact centre's phone, no search, only text. */
export const ServerError: Story = {
  globals: { ...wideGlobals },
  render: () => <StatusPages status="server-error" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('link', { name: '000 000 00 00' })).toBeVisible()
    await expect(canvasElement.querySelectorAll('search')).toHaveLength(1)
  },
}

/** Service unavailable: closed until a time, with other ways to do the task. */
export const ServiceUnavailable: Story = {
  globals: { ...wideGlobals },
  render: () => <StatusPages status="unavailable" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByText(/Tuesday 13 October 2026 at 08:00/)).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Use the paper form' })).toBeVisible()
  },
}

/** 320px: one column, no sideways scroll. */
export const Narrow: Story = {
  ...NotFound,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left. */
export const RTL: Story = {
  ...NotFound,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours. */
export const ForcedColors: Story = {
  ...NotFound,
  globals: { forcedColors: 'active', ...wideGlobals },
}
