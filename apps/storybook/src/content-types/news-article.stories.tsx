import { PageFrame } from '@kvirn-ui/patterns'
import { NewsArticle } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/news-article/news-article.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/News article: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S9).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `One news item: the title, when it was published (and updated), read aloud, a preamble, a figure, the prose, related news and the page tools. The column is the reading width. Built from [Breadcrumb](?path=/docs/components-navigation-breadcrumb--docs), [Page tools](?path=/docs/patterns-site-chrome-page-tools--docs), \`Prose\`, \`Heading\` and a [List](?path=/docs/components-content-list--docs).

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb is named; nothing is sticky and nothing is reordered with CSS. Dates are \`<time>\` elements written with the provider's \`useFormat\`. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/News article',
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

/** Published, with a figure. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <NewsArticle />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** Updated: the date of the change follows the date of publication, both as text. */
export const Updated: Story = {
  globals: { ...wideGlobals },
  render: () => <NewsArticle state="updated" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** No image: the preamble is followed straight by the prose. */
export const NoImage: Story = {
  globals: { ...wideGlobals },
  render: () => <NewsArticle image={false} />,
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

/** Right to left; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
