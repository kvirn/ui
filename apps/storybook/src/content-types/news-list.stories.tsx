import { PageFrame } from '@kvirn-ui/patterns'
import { NewsList } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/news-list/news-list.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/News list: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S9).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `The news archive: the title, how many items are shown, the news list newest first and Pagination. Items are \`h2\` under the \`h1\`, one link each, in the heading. The filtered state comes with Search and filter. Built from [Breadcrumb](?path=/docs/components-navigation-breadcrumb--docs), a [List](?path=/docs/components-content-list--docs) and [Pagination](?path=/docs/patterns-news-events-and-notices-pagination--docs).

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb is named; nothing is sticky and nothing is reordered with CSS. Dates are \`<time>\` elements written with the provider's \`useFormat\`. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/News list',
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

/** Page 1 of 3. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <NewsList />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** The last page: three items, no Next. */
export const LastPage: Story = {
  globals: { ...wideGlobals },
  render: () => <NewsList page="last" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** Nothing published: an empty state, no list and no pagination. */
export const Empty: Story = {
  globals: { ...wideGlobals },
  render: () => <NewsList page="empty" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: one column; Pagination collapses to Previous, status and Next. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
