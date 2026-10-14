import { PageFrame } from '@kvirn-ui/patterns'
import { ContentPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/content-page/content-page.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Content page: a whole page in the site chrome (docs/design/storybook-patterns.md section 7).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `A page that answers one question: what it is, who it is for, how to do it, what it costs and who to ask. The section navigation sits beside \`main\` from \`64rem\` and above it, collapsed behind a button, below it. The \`h1\` is followed by read aloud, the preamble and a contents list; the prose has \`h2\` sections, with the FAQ as an Accordion of \`h3\` triggers.

Written as literal JSX from the patterns and shipped components: [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs) with its sidebar, [Breadcrumb](?path=/docs/components-navigation-breadcrumb--docs), [Section nav](?path=/docs/patterns-navigation-and-promotion-section-nav--docs), [Page tools](?path=/docs/patterns-site-chrome-page-tools--docs), [Service link](?path=/docs/patterns-navigation-and-promotion-service-link--docs), [Contact card](?path=/docs/patterns-places-and-contacts-contact-card--docs), a group of related links (a \`Heading\` and a [List](?path=/docs/components-content-list--docs)), and the library's \`TableOfContents\`, \`Prose\` and \`Accordion\`. \`TableOfContents\` takes its headings as an \`items\` prop, so the entries are written inline and must match the \`id\`s of the headings.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb and the section navigation are named and distinct; nothing is sticky and the sidebar is first in the DOM, so reading, focus and visual order agree. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Content page',
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

/** The page with the e-service open: the Service link is the one next step, with the other ways to apply under it. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <ContentPage />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** The e-service is closed: the Service link is replaced by the reason and the other ways to apply, still in the same place. */
export const ServiceLinkClosed: Story = {
  globals: { ...wideGlobals },
  render: () => <ContentPage eService="closed" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** A longer page: more `h2` sections and an `h3`, so the contents list nests. Nothing is sticky; the list is reached by Tab like any other. */
export const LongPage: Story = {
  globals: { ...wideGlobals },
  render: () => <ContentPage length="long" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: the section navigation is a button above `main`; one column, no sideways scroll. */
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
