import contract from '../../../../../packages/react/src/announcer/announcer.a11y.md?raw'
import guide from '../../../../../packages/react/src/announcer/announcer.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { localeOf, withFormLocale } from '../form/form.fixture.tsx'
import { AnnouncementButtons, BurstsAndBlanks } from './announcer.fixture.tsx'

// Components/Announcer: the shared live regions behind useAnnouncer(). KvirnProvider
// renders them (the withFormLocale decorator is the app's provider here), so there is nothing to
// see: the fixture's buttons call announce() and list what they sent. The regions are internal
// and not exported, so the page has no `component` and no controls: the public API is the hook,
// and every story shows the function that calls it. announcer.test.tsx proves the regions, the
// clear-then-set and the throttle.

const meta = {
  title: 'Components/Data and behaviour/Announcer',
  globals: { locale: 'sv' },
  decorators: [withFormLocale],
  parameters: {
    a11yContract: contract,
    docs: {
      description: { component: usageGuide(guide) },
      ...showSource('announcer/announcer.fixture.tsx', 'AnnouncementButtons').docs,
    },
  },
  render: (_args, { globals }) => <AnnouncementButtons locale={localeOf(globals)} />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * A polite message: the screen reader finishes what it is saying, then reads it. The text appears
 * in a live region that was already in the page, a moment after the region was emptied.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
    await userEvent.click(canvas.getByRole('button', { name: 'Säg det vänligt' }))
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Ändringarna är sparade'),
    )
    await expect(canvas.getByRole('alert')).toBeEmptyDOMElement()
  },
}

/** An assertive message interrupts the screen reader. Only for something to act on right now. */
export const Assertive: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Säg det med eftertryck' }))
    await waitFor(() =>
      expect(canvas.getByRole('alert')).toHaveTextContent('Sessionen har gått ut. Logga in igen.'),
    )
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
  },
}

/** The same message twice: the region is emptied and filled again, so it is read again. */
export const RepeatedMessage: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Upprepa samma meddelande' })
    await userEvent.click(button)
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Ändringarna är sparade'),
    )
    await userEvent.click(button)
    await expect(canvas.getByTestId('last-call')).toHaveTextContent('skickades')
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Ändringarna är sparade'),
    )
  },
}

/** A message with a key is throttled: a second click inside three seconds is dropped. */
export const Throttled: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', {
      name: 'Meddelande med nyckel (högst ett var tredje sekund)',
    })
    await userEvent.click(button)
    await expect(canvas.getByTestId('last-call')).toHaveTextContent('skickades')
    await userEvent.click(button)
    await expect(canvas.getByTestId('last-call')).toHaveTextContent('släpptes')
  },
}

/**
 * `throttleMilliseconds: 0` turns the throttle off for a key. Two messages inside 100 ms leave
 * only the second in the region, so batch related changes into one sentence. A blank message is
 * dropped. A message is also removed from the region after 5 seconds.
 */
export const BurstsAndBlankMessages: Story = {
  parameters: showSource('announcer/announcer.fixture.tsx', 'BurstsAndBlanks'),
  render: (_args, { globals }) => <BurstsAndBlanks locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const unthrottled = canvas.getByRole('button', { name: 'Samma nyckel, utan spärr' })
    await userEvent.click(unthrottled)
    await userEvent.click(unthrottled)
    await expect(canvas.getByTestId('last-call')).toHaveTextContent('skickades')
    await userEvent.click(canvas.getByRole('button', { name: 'Två meddelanden på en gång' }))
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Sessionen har gått ut. Logga in igen.'),
    )
    await expect(canvas.getByRole('status')).not.toHaveTextContent('Ändringarna är sparade')
    await userEvent.click(canvas.getByRole('button', { name: 'Tomt meddelande' }))
    await expect(canvas.getByTestId('last-call')).toHaveTextContent('släpptes (tomt)')
  },
}

/** Finnish: the strings and `lang` follow the locale. The announcer adds no text of its own. */
export const Finnish: Story = {
  globals: { locale: 'fi' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Sano se kohteliaasti' }))
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('Muutokset on tallennettu'),
    )
  },
}
