import contract from '../../../../../packages/react/src/announcer/announcer.a11y.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { AnnouncerDemo, fixtureLocaleOf } from './announcer.fixture.tsx'

// Components/Announcer: the shared live regions behind useAnnouncer() (ADR-0040). KvirnProvider
// renders them, so there is nothing to see: the fixture's buttons call announce() and list what
// they sent. announcer.test.tsx proves the regions, the clear-then-set and the throttle.

const meta = {
  title: 'Components/Announcer',
  component: AnnouncerDemo,
  args: { locale: 'sv' },
  argTypes: { locale: { control: false } },
  globals: { locale: 'sv' },
  parameters: { a11yContract: contract },
  render: (_args, { globals }) => <AnnouncerDemo locale={fixtureLocaleOf(globals)} />,
} satisfies Meta<typeof AnnouncerDemo>

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
