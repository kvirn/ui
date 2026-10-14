import { PageFrame } from '@kvirn-ui/patterns'
import { Contact } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import source from '../../../../packages/patterns/src/content-types/contact/contact.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Contact: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S6).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `How to reach the municipality: the contact centre as a Contact card, opening hours, the visiting address with a directions link and access facts, a Service link (\`Report a fault\`) and a list of other ways. See [Opening hours](?path=/docs/patterns-places-and-contacts-opening-hours--docs), [Address and visit](?path=/docs/patterns-places-and-contacts-address-and-visit--docs) and [Contact card](?path=/docs/patterns-places-and-contacts-contact-card--docs). Written as literal JSX from shipped parts.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; DOM order, reading order and focus order agree and nothing is sticky. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Contact',
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

/** The normal week. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <Contact />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** An exception for the holidays: an inset with its own heading after the hours. */
export const HolidayException: Story = {
  globals: { ...wideGlobals },
  render: () => <Contact state="holiday" />,
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** The phone lines are closed today: said in words in the card and in a warning, with the e-mail as the other way. */
export const PhoneLinesClosed: Story = {
  globals: { ...wideGlobals },
  render: () => <Contact state="phone-closed" />,
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
