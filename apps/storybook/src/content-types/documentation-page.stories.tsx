import { PageFrame } from '@kvirn-ui/patterns'
import { DocumentationPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/documentation-page/documentation-page.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Documentation page: a whole page in the site chrome (docs/design/storybook-patterns.md section 7).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `A page of a documentation site, in the frame of the reference site: the section navigation beside \`main\` (grouped, collapsed behind a button below \`64rem\`), a breadcrumb, an \`h1\` and a lead, the contents list, prose with an example and two tables, and previous and next links at the end. The page is English and \`lang="en"\` whatever the toolbar says.

Written as literal JSX from the patterns and shipped components: [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs), [Breadcrumb](?path=/docs/components-navigation-breadcrumb--docs), [Section nav](?path=/docs/patterns-navigation-and-promotion-section-nav--docs), and \`TableOfContents\`, \`Prose\`, \`CodeBlock\`, \`Table\`, \`Kbd\` and \`Pagination\`. The previous and next links are a \`Pagination\` with only \`Previous\` and \`Next\`, named by its \`label\`. The header is the KvirnUI docs header: the brand, search and four links, without a language switch or shortcuts.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb, the section navigation and the previous and next links are named and distinct; the tables are named and scroll in a named region only when they overflow; nothing is sticky. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Documentation page',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  decorators: [withShell],
  parameters: {
    layout: 'fullscreen',
    shell: { header: 'docs' },
    docs: { description: { component: description }, source: { code: source } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** A component page: contents, example, keyboard and API tables, then previous and next. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <DocumentationPage />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: the section navigation is a button above `main`; the tables scroll inside their own region, not the page. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the sidebar moves to the right of `main`; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
