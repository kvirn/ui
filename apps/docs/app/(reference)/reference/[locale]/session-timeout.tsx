'use client'
import { AlertDialog, Button, useAnnouncer } from '@kvirn-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { referenceEserviceMessages } from '../../../../messages/reference-eservice.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'

const minuteMs = 60_000
// A demo value: a real service warns after its own idle time, here the warning shows after five quiet minutes.
const idleBeforeWarningMs = 5 * minuteMs
const minutesBeforeEnd = 2

// Inside the popup, so `useAnnouncer` reaches the dialog's own live region: the provider's is inert while a modal is open.
function Countdown({
  locale,
  open,
  onExpire,
}: {
  locale: ReferenceLocale
  open: boolean
  onExpire: () => void
}) {
  const text = referenceEserviceMessages[locale].timeout
  const { announce } = useAnnouncer()
  const [minutesLeft, setMinutesLeft] = useState(minutesBeforeEnd)

  useEffect(() => {
    if (!open) {
      return
    }
    setMinutesLeft(minutesBeforeEnd)
    let left = minutesBeforeEnd
    const timer = setInterval(() => {
      left -= 1
      setMinutesLeft(left)
      if (left === 1) {
        announce(text.oneMinuteLeft)
      } else if (left <= 0) {
        onExpire()
      }
    }, minuteMs)
    return () => clearInterval(timer)
  }, [open, announce, onExpire, text.oneMinuteLeft])

  return (
    <AlertDialog.Description>
      {text.warningBody({ time: text.minutes({ count: Math.max(minutesLeft, 1) }) })}
    </AlertDialog.Description>
  )
}

/**
 * The B25 timeout warning of the apply steps (2.2.1): an alertdialog two minutes before the session ends,
 * with the time left in words rewritten once a minute and one polite announcement at one minute.
 * The session is simulated: nothing is signed out, the answers stay in sessionStorage.
 */
export function SessionTimeout({ locale }: { locale: ReferenceLocale }) {
  const text = referenceEserviceMessages[locale].timeout
  const router = useRouter()
  const stayRef = useRef<HTMLButtonElement>(null)
  const simulateRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const expiredHref = `/reference/${locale}/parking/disabled-parking-permit/apply/timeout`
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const warn = useCallback(() => {
    setOpen(true)
  }, [])

  useEffect(() => {
    if (open) {
      return
    }
    const restart = () => {
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(warn, idleBeforeWarningMs)
    }
    restart()
    window.addEventListener('keydown', restart)
    window.addEventListener('pointerdown', restart)
    return () => {
      clearTimeout(idleTimer.current)
      window.removeEventListener('keydown', restart)
      window.removeEventListener('pointerdown', restart)
    }
  }, [open, warn])

  return (
    <>
      <Button ref={simulateRef} onClick={warn}>
        {text.simulate}
      </Button>
      <AlertDialog.Root
        open={open}
        onOpenChange={setOpen}
        initialFocusRef={stayRef}
        finalFocusRef={simulateRef}
      >
        <AlertDialog.Popup>
          <AlertDialog.Title>{text.warningTitle}</AlertDialog.Title>
          <Countdown
            locale={locale}
            open={open}
            onExpire={() => {
              setOpen(false)
              router.push(expiredHref)
            }}
          />
          <AlertDialog.Actions>
            <AlertDialog.Close ref={stayRef} className="kv-button kv-button--primary">
              {text.stay}
            </AlertDialog.Close>
            <Button
              onClick={() => {
                setOpen(false)
                router.push(expiredHref)
              }}
            >
              {text.signOut}
            </Button>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
    </>
  )
}
