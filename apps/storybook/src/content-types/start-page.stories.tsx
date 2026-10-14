import { PageFrame } from '@kvirn-ui/patterns'
import { StartPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/start-page/start-page.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Start page: a whole page in the site chrome (docs/design/storybook-patterns.md section 7).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `The front door of the site: who the municipality is, the most-done tasks, the topics, what is new and how to reach someone. One \`h1\` in the hero, then \`h2\` sections in the order a visitor needs them. The hero has no search field of its own because the header search is the page's search.

Written as literal JSX from the patterns: [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs), [Site header](?path=/docs/patterns-site-chrome-site-header--docs), [Site alert](?path=/docs/patterns-site-chrome-site-alert--docs), [Hero](?path=/docs/patterns-navigation-and-promotion-hero--docs), top tasks (a \`Heading\` over \`Grid.Root as="ul"\` of [Link](?path=/docs/components-actions-link--docs)s, six links here and eight under the site alert), [Nav tiles](?path=/docs/patterns-navigation-and-promotion-nav-tiles--docs), [Card](?path=/docs/components-content-card--docs), [Contact card](?path=/docs/patterns-places-and-contacts-contact-card--docs) and [Site footer](?path=/docs/patterns-site-chrome-site-footer--docs). Copy the story's code and replace the text. News and events are Cards in \`Grid.Root as="ul"\` until a News list and an Event list exist.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the site alert is a named region before \`main\`; every repeated navigation has its own name; nothing is sticky and nothing is reordered with CSS. Designed and tested to meet WCAG 2.2 AA.

## Parts and gaps

\`PageFrame.Main bleed\` is a full-width \`main\` with no \`Container\`, so the Hero and each band bring their own \`Container\`.
`

const meta = {
  title: 'Content types/Start page',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  decorators: [withShell],
  parameters: {
    layout: 'fullscreen',
    shell: { header: 'kvirnby', current: 'page' },
    docs: { description: { component: description }, source: { code: source } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The start page without a notice: hero, top tasks, topics, news, events, one feature and contact, in that order. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <StartPage />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** A site alert, a named region between the header and `main`. Close it and focus moves to `main`. The top tasks are eight links. */
export const WithSiteAlert: Story = {
  globals: { ...wideGlobals },
  parameters: { shell: { siteAlert: true } },
  render: () => <StartPage topTasks={8} />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: one column, the tiles and cards stacked in DOM order, no sideways scroll. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the hero, the tile grid and the rows mirror; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
