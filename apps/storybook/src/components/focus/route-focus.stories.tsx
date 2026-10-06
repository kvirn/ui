import contract from '../../../../../packages/react/src/route-focus/route-focus.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { showSource } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { RouteFocusPage } from './route-focus.fixture.tsx'
import type { RouteFocusFixtureLocale } from './route-focus.fixture.tsx'

// Foundation/Focus, the route part (useRouteFocus, Plan 0085): the hook renders nothing, so the fixture is a page with two fake routes
// (links) and a link to a section. The key is the route, the hash is kept apart. The hook's
// behaviour with a real history (pushState, Back, Forward) is proved in use-route-focus.test.tsx.

const localeFor = (globals: Record<string, unknown>): RouteFocusFixtureLocale =>
  localeOf(globals) === 'sv' ? 'sv' : 'en'

const meta = {
  title: 'Foundation/Focus',
  // Another file of the same Foundation/Focus entry: its own id keeps the story ids apart.
  id: 'foundation-focus-route',
  tags: ['!autodocs'],
  globals: { locale: 'sv' },
  decorators: [withFormLocale],
  parameters: {
    a11yContract: contract,
    docs: {
      ...showSource('focus/route-focus.fixture.tsx', 'RouteFocusPage').docs,
    },
  },
  render: (_args, { globals }) => <RouteFocusPage locale={localeFor(globals)} />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Change the route and focus moves to the new page's title, which a screen reader reads. The
 * first render moves nothing. The ring shows for the keyboard only, as it does on any focus.
 */
export const Default: Story = {
  name: 'Route change',
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).not.toHaveFocus()
    await userEvent.click(canvas.getByRole('link', { name: 'Till tjänster' }))
    await waitFor(() => expect(canvas.getByRole('heading', { level: 1 })).toHaveFocus())
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Våra tjänster')
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveAttribute('tabindex', '-1')
  },
}

/**
 * After the move the title is the start of the sequence: Tab goes on into the page, Shift+Tab
 * back to the header. The title has no Tab stop of its own once focus has left it.
 */
export const Keyboard: Story = {
  name: 'Route keyboard',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Till tjänster' }))
    await waitFor(() => expect(canvas.getByRole('heading', { level: 1 })).toHaveFocus())
    await userEvent.tab()
    await expect(canvas.getByRole('link', { name: 'Första länken på sidan' })).toHaveFocus()
    await expect(canvas.getByRole('heading', { level: 1 })).not.toHaveAttribute('tabindex')
    await userEvent.tab({ shift: true })
    await expect(
      canvas.getByRole('link', { name: 'Hoppa till avsnittet längre ner' }),
    ).toHaveFocus()
  },
}

/** A hash change is not a new page: focus stays on the link that was used. */
export const HashChange: Story = {
  name: 'Route hash change',
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Hoppa till avsnittet längre ner' })
    await userEvent.click(link)
    await expect(link).toHaveFocus()
    await expect(canvas.getByRole('heading', { level: 1 })).not.toHaveAttribute('tabindex')
  },
}

/** `announce` also says the title in the live region, for a router that has no announcer. */
export const Announce: Story = {
  name: 'Route announce',
  render: (_args, { globals }) => <RouteFocusPage locale={localeFor(globals)} announce />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Till tjänster' }))
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Du har kommit till'))
  },
}

/** Right to left, in English: the same behaviour, the ring follows the writing direction. */
export const RTL: Story = {
  name: 'Route RTL',
  globals: { dir: 'rtl', locale: 'en' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'To services' }))
    await waitFor(() => expect(canvas.getByRole('heading', { level: 1 })).toHaveFocus())
  },
}
