import { PageFrame } from '@kvirn-ui/patterns'
import { EventListPage } from '@kvirn-ui/patterns/content-types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import source from '../../../../packages/patterns/src/content-types/event-list/event-list.tsx?raw'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { expectPageOutline } from './page-outline.ts'
import { withShell } from './shell.tsx'
// Content types/Event list: a whole page in the site chrome (docs/design/storybook-patterns-t5.md S11).
// The page is a component in `@kvirn-ui/patterns/content-types`; the source panel shows its module text, which an adopter copies.

const description = `The events archive: the title, the filters (category as a [CheckboxGroup](?path=/docs/components-choice-and-overlays-checkboxgroup--docs) and a [DateRangePicker](?path=/docs/components-forms-daterangepicker--docs) after two typed date fields), the result count, the events and Pagination. Typing a date always works. The filters change the list in place and say the new count once, politely, through the provider's announcer. A cancelled event starts its title with "Cancelled:" and adds a Badge; a moved event says its new date in words.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Event list',
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

/** Five events of 14, with the filters above and Pagination below. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => <EventListPage />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('heading', { level: 2, name: '14 results' })).toBeVisible()
  },
}

/** One category applied: the count follows. */
export const Filtered: Story = {
  globals: { ...wideGlobals },
  render: () => <EventListPage state="filtered" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(canvas.getByRole('heading', { level: 2, name: '2 results' })).toBeVisible()
  },
}

/** No upcoming events: an empty state, no filters and no pagination. */
export const Empty: Story = {
  globals: { ...wideGlobals },
  render: () => <EventListPage state="empty" />,
  play: async ({ canvasElement, canvas }) => {
    await expectPageOutline(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'There are no upcoming events' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('link', { name: /^Next/ })).toBeNull()
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

/** Ticking a category changes the list in place and focus stays on the checkbox. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: () => <EventListPage />,
  play: async ({ canvas }) => {
    const culture = canvas.getByRole('checkbox', { name: 'Culture' })
    culture.focus()
    await userEvent.keyboard(' ')
    await expect(culture).toHaveFocus()
    await expect(canvas.getByRole('heading', { level: 2, name: '1 result' })).toBeVisible()
  },
}

/** A typed date that becomes complete filters the list and says the new count once, politely. */
export const TypedDateAnnounced: Story = {
  globals: { ...wideGlobals },
  render: () => <EventListPage />,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: /^From/ }), '24102026')
    await expect(canvas.getByRole('heading', { level: 2, name: '3 results' })).toBeVisible()
    const spoken = () =>
      [...canvasElement.ownerDocument.querySelectorAll('[aria-live="polite"]')]
        .map((region) => region.textContent)
        .join('')
    await waitFor(() => expect(spoken()).toContain('3 results'))
  },
}

/** Right to left; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
