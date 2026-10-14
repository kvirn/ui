import { PageFrame } from '@kvirn-ui/patterns'
import { EventPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/event/event.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Event: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S11).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `One event: the title, the facts as a [DefinitionList](?path=/docs/components-data-and-behaviour-definitionlist--docs) (when, where, cost, accessibility, organiser), the Service link to book, then the description. A cancelled event starts its title with "Cancelled:", says so in an \`Alert.Warning\` and has no booking link; an ended event has an inset; a fully booked event says so in text, never a dimmed link. Dates and times are \`<time>\` elements written with the provider's \`useFormat\`.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb is named; nothing is sticky. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Event',
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

/** An upcoming event with a booking link. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <EventPage />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('link', { name: 'Book a place' })).toBeVisible()
  },
}

/** Cancelled: "Cancelled:" first in the title, a warning, no booking link. */
export const Cancelled: Story = {
  globals: { ...wideGlobals },
  render: () => <EventPage state="cancelled" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1, name: /^Cancelled: / })).toBeVisible()
    await expect(canvas.queryByRole('link', { name: 'Book a place' })).toBeNull()
  },
}

/** Ended: an inset says so, and there is nothing to book. */
export const Ended: Story = {
  globals: { ...wideGlobals },
  render: () => <EventPage state="ended" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByText(/This event has ended/)).toBeVisible()
    await expect(canvas.queryByRole('link', { name: 'Book a place' })).toBeNull()
  },
}

/** Fully booked: text, not a dimmed link. */
export const FullyBooked: Story = {
  globals: { ...wideGlobals },
  render: () => <EventPage state="fully-booked" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByText(/Fully booked/)).toBeVisible()
    await expect(canvas.queryByRole('link', { name: 'Book a place' })).toBeNull()
  },
}

/** 320px: the facts stack and wrap; nothing scrolls sideways. */
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
