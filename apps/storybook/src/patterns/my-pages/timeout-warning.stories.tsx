import { en } from '@kvirn-ui/i18n/en'
import {
  Alert,
  AlertDialog,
  Button,
  Heading,
  KvirnProvider,
  Link,
  useAnnouncer,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, useState } from 'react'
import { readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { expect, userEvent, waitFor } from 'storybook/test'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import contract from '../../../../../packages/patterns/src/my-pages/timeout-warning/timeout-warning.a11y.md?raw'

// Patterns/My pages/Timeout warning (docs/design/storybook-patterns-t5.md S12).
// Story-only: the session timer is the app's. "Simulate session timeout" stands in for it.

const description = `Keep my session, or leave safely, before it ends (WCAG 2.2.1 Timing Adjustable). An [AlertDialog](?path=/docs/components-alert-dialog--docs) opens two minutes before the session ends: a title ("You will be signed out soon"), the time left in words, "Stay signed in" (primary, initial focus, so Enter extends the session with one action) and "Sign out". It has no trigger, so \`finalFocusRef\` returns focus to where the user was.

The time left is in the description, so it is read when the dialog opens, then rewritten once a minute. It is not a live region and never counts seconds. With one minute left it announces once, politely, through the dialog's own announcer ("One minute left until you are signed out"): the provider's live regions are inert while the modal is open, so \`useAnnouncer\` is called from a component inside \`AlertDialog.Popup\`. Escape and a press outside never sign the user out: Escape stays signed in. When the time runs out the dialog closes and the user lands on the [Session ended](?path=/docs/content-types-session-ended--docs) page, which says whether the answers were saved.

## Parts and gaps

Parts used: \`AlertDialog.Root\`, \`.Popup\`, \`.Title\`, \`.Description\`, \`.Actions\`, \`.Close\`, \`Button\`, \`useAnnouncer\` (inside the Popup). No gap. The plays do not wait: the interval is the app's, and the controls change the same state.
`

const meta = {
  title: 'Patterns/My pages/Timeout warning',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    layout: 'padded',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const minuteMs = 60_000

function minutesInWords(minutes: number) {
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
}

function OneMinuteAnnouncement({ minutesLeft }: { minutesLeft: number }) {
  const { announce } = useAnnouncer()
  useEffect(() => {
    if (minutesLeft === 1) {
      announce('One minute left until you are signed out.')
    }
  }, [minutesLeft, announce])
  return null
}

function TimeoutWarning({
  expired = false,
  minutesAtOpen = 2,
}: {
  expired?: boolean
  minutesAtOpen?: number
}) {
  const stayRef = useRef<HTMLButtonElement>(null)
  const simulateRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [minutesLeft, setMinutesLeft] = useState(2)
  const [signedOut, setSignedOut] = useState(expired)
  const [extended, setExtended] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    const timer = setInterval(() => {
      setMinutesLeft((left) => left - 1)
    }, minuteMs)
    return () => clearInterval(timer)
  }, [open])

  if (open && minutesLeft <= 0) {
    setOpen(false)
    setSignedOut(true)
  }

  return (
    <div lang="en" className="kv-stack">
      <Heading as="h1" size="heading-1">
        Application for a preschool place
      </Heading>
      <p>
        Your answers are saved as you go. The session ends after a period of inactivity, and a
        warning comes first.
      </p>
      {signedOut ? (
        <Alert.Info>
          <Alert.Title as="p">You have been signed out</Alert.Title>
          <Alert.Body>
            Your answers are saved.{' '}
            <Link.Root href="#session-ended">Read what to do next</Link.Root>.
          </Alert.Body>
        </Alert.Info>
      ) : null}
      {extended ? (
        <Alert.Success>
          <Alert.Title as="p">You are still signed in</Alert.Title>
          <Alert.Body>The session was extended.</Alert.Body>
        </Alert.Success>
      ) : null}
      <div className="kv-button-group">
        <Button
          ref={simulateRef}
          onClick={() => {
            setMinutesLeft(minutesAtOpen)
            setSignedOut(false)
            setExtended(false)
            setOpen(true)
          }}
        >
          Simulate session timeout
        </Button>
      </div>
      <AlertDialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setExtended(true)
          }
        }}
        initialFocusRef={stayRef}
        finalFocusRef={simulateRef}
      >
        <AlertDialog.Popup>
          <OneMinuteAnnouncement minutesLeft={minutesLeft} />
          <AlertDialog.Title>You will be signed out soon</AlertDialog.Title>
          <AlertDialog.Description>
            For your security, we will sign you out in {minutesInWords(minutesLeft)}. Your answers
            are saved.
          </AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close ref={stayRef} className="kv-button kv-button--primary">
              Stay signed in
            </AlertDialog.Close>
            <Button
              onClick={() => {
                setOpen(false)
                setSignedOut(true)
              }}
            >
              Sign out
            </Button>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
    </div>
  )
}

const withProvider: NonNullable<Story['decorators']> = [
  (Story) => (
    <KvirnProvider locale="en" messages={en}>
      <Story />
    </KvirnProvider>
  ),
]

/** Two minutes left: focus is on "Stay signed in", and the time is in the description. */
export const Warning: Story = {
  decorators: withProvider,
  render: () => <TimeoutWarning />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Simulate session timeout' }))
    const dialog = await canvas.findByRole('alertdialog', { name: 'You will be signed out soon' })
    await expect(dialog).toHaveAccessibleDescription(/in 2 minutes/)
    await expect(canvas.getByRole('button', { name: 'Stay signed in' })).toHaveFocus()
    await expect(canvas.getByText(/we will sign you out in 2 minutes/)).not.toHaveAttribute(
      'aria-live',
    )
  },
}

/** One minute left (simulated, no wait): the dialog's own live region announces it once, politely. */
export const OneMinuteLeft: Story = {
  decorators: withProvider,
  render: () => <TimeoutWarning minutesAtOpen={1} />,
  play: async ({ canvas, canvasElement }) => {
    const announcements = await readAnnouncements(canvasElement, async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Simulate session timeout' }))
    })
    // The reader also lists the alertdialog itself as an assertive phrase; only the polite one is ours.
    await expect(announcements.filter((phrase) => phrase.startsWith('polite:'))).toEqual([
      'polite: One minute left until you are signed out.',
    ])
    await expect(canvas.getByRole('alertdialog')).toHaveAccessibleDescription(/in 1 minute\./)
  },
}

/** One press on "Stay signed in" extends the session and returns focus to where the user was. */
export const Extended: Story = {
  decorators: withProvider,
  render: () => <TimeoutWarning />,
  play: async ({ canvas }) => {
    const simulate = canvas.getByRole('button', { name: 'Simulate session timeout' })
    await userEvent.click(simulate)
    await userEvent.click(await canvas.findByRole('button', { name: 'Stay signed in' }))
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull())
    await expect(canvas.getByText('You are still signed in')).toBeVisible()
    await waitFor(() => expect(simulate).toHaveFocus())
  },
}

/** The time ran out, or "Sign out" was pressed: the page says so in words and links on. */
export const Expired: Story = {
  decorators: withProvider,
  render: () => <TimeoutWarning expired />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('You have been signed out')).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Read what to do next' })).toBeVisible()
  },
}

/** 320px: the dialog fits, nothing scrolls sideways. */
export const Narrow: Story = {
  ...Warning,
  globals: { ...narrowGlobals },
}

/** 80rem. */
export const Wide: Story = {
  ...Warning,
  globals: { ...wideGlobals },
}

/** Try the keys: Enter on the control opens it, "Stay signed in" has focus, Escape stays signed in. */
export const Keyboard: Story = {
  ...Extended,
  play: async ({ canvas }) => {
    const simulate = canvas.getByRole('button', { name: 'Simulate session timeout' })
    simulate.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Stay signed in' })).toHaveFocus(),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull())
    await expect(canvas.getByText('You are still signed in')).toBeVisible()
    await waitFor(() => expect(simulate).toHaveFocus())
  },
}

/** Right to left. */
export const RTL: Story = {
  ...Warning,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the dialog keeps a visible edge, and "Stay signed in" is still the primary action in words. */
export const ForcedColors: Story = {
  ...Warning,
  globals: { forcedColors: 'active' },
}
