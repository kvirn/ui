import { PageFrame } from '@kvirn-ui/patterns'
import { Subpage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/subpage/subpage.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Subpage: a whole page in the site chrome (docs/design/storybook-patterns.md section 7).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `A topic page that sends the visitor on: a title, a short preamble and a tile for each child page. Below the tiles come shortcuts, one piece of news and who to ask. It has no section navigation, because the tiles are the navigation. There is no sidebar, so the page is one column at every width.

Written as literal JSX from the patterns: [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs), [Breadcrumb](?path=/docs/components-navigation-breadcrumb--docs), [Nav tiles](?path=/docs/patterns-navigation-and-promotion-nav-tiles--docs), [List](?path=/docs/components-content-list--docs), [Contact card](?path=/docs/patterns-places-and-contacts-contact-card--docs) and [Page tools](?path=/docs/patterns-site-chrome-page-tools--docs). The tiles are \`h2\`, so the page's outline is flat: every block under the \`h1\` is an \`h2\`.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb is before \`main\` and named; nothing is sticky and nothing is reordered with CSS. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Subpage',
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

/** Five child pages as tiles, then shortcuts, one piece of news, the contact card and the page tools. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <Subpage />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** A topic with three children: the tiles fill one row. */
export const ThreeChildren: Story = {
  globals: { ...wideGlobals },
  render: () => <Subpage childPages={3} />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** A topic with seven children: the tiles wrap into rows; the order is still the DOM order. */
export const SevenChildren: Story = {
  globals: { ...wideGlobals },
  render: () => <Subpage childPages={7} />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: one column of tiles, no sideways scroll. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the tile grid mirrors; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
