import { PageFrame } from '@kvirn-ui/patterns'
import { UnitPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/unit-page/unit-page.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Unit page: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S6).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `One unit, here a preschool: the \`h1\`, a lead, a figure, an about section, opening hours, the address and access, a Contact card, the Service link \`Apply for a place\` and related units. The figure is plain \`figure\` markup. See [Opening hours](?path=/docs/patterns-places-and-contacts-opening-hours--docs), [Address and visit](?path=/docs/patterns-places-and-contacts-address-and-visit--docs) and [Contact card](?path=/docs/patterns-places-and-contacts-contact-card--docs).

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; DOM order, reading order and focus order agree and nothing is sticky. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Unit page',
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

/** The unit is open and takes applications. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <UnitPage />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** Temporarily closed: a warning first in `main`, and the Service link replaced by the reason and the way round. */
export const TemporarilyClosed: Story = {
  globals: { ...wideGlobals },
  render: () => <UnitPage status="temporarily-closed" />,
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

/** Right to left: the page mirrors; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
