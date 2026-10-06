import { AlertDialog, Button, useFormat } from '@kvirn-ui/react'
import type { AlertDialogRootProps } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/AlertDialog: each function is one example, and the story's "Show code"
// prints it (`showSource`), so it reads the way an adopter writes it. The words are example content
// (docs/design/dialog.md §4), not the component's strings: an AlertDialog has none. sv, fi and en
// are written; the other locales show the English text, marked lang="en" (3.1.2).

interface AlertDialogTexts {
  draft: string
  deleteTrigger: string
  deleteTitle: string
  deleteDescription: string
  deleteConfirm: string
  deleteKeep: string
  deleted: string
  kept: string
  timeoutOpen: string
  timeoutTitle: string
  timeoutDescription: (minutes: string, time: string) => string
  timeoutRemaining: (duration: string) => string
  timeoutStay: string
  timeoutSignOut: string
  stayed: string
  signedOut: string
  minutes: (count: number) => string
  seconds: (count: number) => string
  textOutside: string
  before: string
  after: string
}

const textsEn: AlertDialogTexts = {
  draft: 'Draft application',
  deleteTrigger: 'Delete the draft',
  deleteTitle: 'Delete the draft application?',
  deleteDescription: "You can't undo this. Your answers will be deleted.",
  deleteConfirm: 'Delete draft',
  deleteKeep: 'Keep draft',
  deleted: 'The draft is deleted.',
  kept: 'The draft is kept.',
  timeoutOpen: 'Show the warning',
  timeoutTitle: 'Do you want to stay signed in?',
  timeoutDescription: (minutes, time) =>
    `For your security, we will sign you out in ${minutes} at ${time}. Your answers are saved.`,
  timeoutRemaining: (duration) => `${duration} left.`,
  timeoutStay: 'Stay signed in',
  timeoutSignOut: 'Sign out',
  stayed: 'You are still signed in.',
  signedOut: 'You are signed out. Your answers are saved.',
  minutes: (count) => `${count} ${count === 1 ? 'minute' : 'minutes'}`,
  seconds: (count) => `${count} ${count === 1 ? 'second' : 'seconds'}`,
  textOutside: 'Text outside the dialog',
  before: 'Before',
  after: 'After',
}

const alertDialogTexts: Partial<Record<FormLocale, AlertDialogTexts>> = {
  en: textsEn,
  sv: {
    draft: 'Utkast till ansökan',
    deleteTrigger: 'Ta bort utkastet',
    deleteTitle: 'Vill du ta bort utkastet till ansökan?',
    deleteDescription: 'Det går inte att ångra. Dina svar tas bort.',
    deleteConfirm: 'Ta bort utkastet',
    deleteKeep: 'Behåll utkastet',
    deleted: 'Utkastet är borttaget.',
    kept: 'Utkastet är kvar.',
    timeoutOpen: 'Visa varningen',
    timeoutTitle: 'Vill du fortsätta vara inloggad?',
    timeoutDescription: (minutes, time) =>
      `Av säkerhetsskäl loggar vi ut dig om ${minutes}, kl. ${time}. Dina svar är sparade.`,
    timeoutRemaining: (duration) => `${duration} kvar.`,
    timeoutStay: 'Fortsätt vara inloggad',
    timeoutSignOut: 'Logga ut',
    stayed: 'Du är fortfarande inloggad.',
    signedOut: 'Du är utloggad. Dina svar är sparade.',
    minutes: (count) => `${count} ${count === 1 ? 'minut' : 'minuter'}`,
    seconds: (count) => `${count} ${count === 1 ? 'sekund' : 'sekunder'}`,
    textOutside: 'Text utanför dialogrutan',
    before: 'Före',
    after: 'Efter',
  },
  fi: {
    draft: 'Hakemusluonnos',
    deleteTrigger: 'Poista luonnos',
    deleteTitle: 'Haluatko poistaa hakemusluonnoksen?',
    deleteDescription: 'Tätä ei voi perua. Vastauksesi poistetaan.',
    deleteConfirm: 'Poista luonnos',
    deleteKeep: 'Säilytä luonnos',
    deleted: 'Luonnos on poistettu.',
    kept: 'Luonnos säilyy.',
    timeoutOpen: 'Näytä varoitus',
    timeoutTitle: 'Haluatko pysyä kirjautuneena?',
    timeoutDescription: (minutes, time) =>
      `Tietoturvasi vuoksi kirjaamme sinut ulos ${minutes} kuluttua, klo ${time}. Vastauksesi on tallennettu.`,
    timeoutRemaining: (duration) => `${duration} jäljellä.`,
    timeoutStay: 'Jatka kirjautuneena',
    timeoutSignOut: 'Kirjaudu ulos',
    stayed: 'Olet edelleen kirjautuneena.',
    signedOut: 'Olet kirjautunut ulos. Vastauksesi on tallennettu.',
    minutes: (count) => `${count} ${count === 1 ? 'minuutti' : 'minuuttia'}`,
    seconds: (count) => `${count} ${count === 1 ? 'sekunti' : 'sekuntia'}`,
    textOutside: 'Teksti valintaikkunan ulkopuolella',
    before: 'Ennen',
    after: 'Jälkeen',
  },
}

/** The fixture text in a locale, or English with `lang="en"` for the locales without text. */
export function alertDialogTextsFor(locale: FormLocale) {
  const text = alertDialogTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? ('en' as const) : undefined }
}

const timeoutSeconds = 120

/**
 * The announced time is rounded up to the minute, and in the last minute to 20 seconds, so a screen
 * reader hears it a few times and not every second.
 */
const announcedSeconds = (secondsLeft: number) =>
  secondsLeft > 60 ? Math.ceil(secondsLeft / 60) * 60 : Math.ceil(secondsLeft / 20) * 20

export type DeleteDraftConfirmationProps = Omit<
  AlertDialogRootProps,
  'children' | 'initialFocusRef'
> & {
  locale: FormLocale
}

/**
 * Confirm before deleting. The danger action is first in the DOM, and focus starts on the safe
 * "Keep draft" (`initialFocusRef`), so an accidental Enter changes nothing. Both are
 * `AlertDialog.Close`, so the dialog closes on its own: Escape does what Keep draft does.
 */
export function DeleteDraftConfirmation({ locale, ...options }: DeleteDraftConfirmationProps) {
  const { text, lang } = alertDialogTextsFor(locale)
  const keepRef = useRef<HTMLButtonElement>(null)
  const [result, setResult] = useState<string | undefined>()
  return (
    <>
      <AlertDialog.Root {...options} initialFocusRef={keepRef}>
        <AlertDialog.Trigger className="kv-button">{text.deleteTrigger}</AlertDialog.Trigger>
        <AlertDialog.Popup lang={lang}>
          <AlertDialog.Title>{text.deleteTitle}</AlertDialog.Title>
          <AlertDialog.Description>{text.deleteDescription}</AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close
              className="kv-button kv-button--danger"
              onClick={() => setResult(text.deleted)}
            >
              {text.deleteConfirm}
            </AlertDialog.Close>
            <AlertDialog.Close
              ref={keepRef}
              className="kv-button"
              onClick={() => setResult(text.kept)}
            >
              {text.deleteKeep}
            </AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <output lang={lang} data-testid="result">
        {result}
      </output>
    </>
  )
}

/**
 * The session timeout warning (B25): opened by state, with no trigger, so `finalFocusRef` says
 * where focus returns. Focus starts on the primary action, "Stay signed in" (`initialFocusRef`).
 * The remaining time sits in a polite region that this fixture updates on the announced beat, and
 * the clock time comes from `useFormat()`, so it follows the locale. Escape and a press on "Stay
 * signed in" both stay signed in. Nothing is lost when the time runs out: the answers are saved.
 */
export function SessionTimeoutWarning({ locale }: { locale: FormLocale }) {
  const { text, lang } = alertDialogTextsFor(locale)
  const format = useFormat()
  const stayRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [expiresAt, setExpiresAt] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds)
  const [outcome, setOutcome] = useState<string | undefined>()

  useEffect(() => {
    if (!open) {
      return
    }
    const timer = setInterval(() => {
      const left = Math.ceil((expiresAt - Date.now()) / 1000)
      if (left <= 0) {
        setOpen(false)
        setOutcome(text.signedOut)
      } else {
        setSecondsLeft(left)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [open, expiresAt, text.signedOut])

  const announced = announcedSeconds(secondsLeft)
  const duration = (seconds: number) =>
    seconds >= 60 ? text.minutes(seconds / 60) : text.seconds(seconds)
  return (
    <>
      <Button
        ref={openerRef}
        onClick={() => {
          setExpiresAt(Date.now() + timeoutSeconds * 1000)
          setSecondsLeft(timeoutSeconds)
          setOutcome(undefined)
          setOpen(true)
        }}
      >
        {text.timeoutOpen}
      </Button>
      <AlertDialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setOutcome(text.stayed)
          }
        }}
        initialFocusRef={stayRef}
        finalFocusRef={openerRef}
      >
        <AlertDialog.Popup lang={lang}>
          <AlertDialog.Title>{text.timeoutTitle}</AlertDialog.Title>
          <AlertDialog.Description>
            {text.timeoutDescription(
              duration(timeoutSeconds),
              format.date(expiresAt, { timeStyle: 'short' }),
            )}
          </AlertDialog.Description>
          <AlertDialog.Body>
            <output>{text.timeoutRemaining(duration(announced))}</output>
          </AlertDialog.Body>
          <AlertDialog.Actions>
            <AlertDialog.Close ref={stayRef} className="kv-button kv-button--primary">
              {text.timeoutStay}
            </AlertDialog.Close>
            <Button
              onClick={() => {
                setOpen(false)
                setOutcome(text.signedOut)
              }}
            >
              {text.timeoutSignOut}
            </Button>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <output lang={lang} data-testid="outcome">
        {outcome}
      </output>
    </>
  )
}

/**
 * What the keyboard tests drive: a line of text and a button before, the alert dialog, and a
 * button after. Try the keys in the Keyboard section above: Enter and Space on the trigger, Tab
 * inside, and Escape.
 */
export function KeyboardAlertDialog({ locale }: { locale: FormLocale }) {
  const { text, lang } = alertDialogTextsFor(locale)
  const keepRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <p data-testid="outside">{text.textOutside}</p>
      <div className="kv-button-group">
        <Button>{text.before}</Button>
        <AlertDialog.Root initialFocusRef={keepRef}>
          <AlertDialog.Trigger className="kv-button">{text.deleteTrigger}</AlertDialog.Trigger>
          <AlertDialog.Popup lang={lang}>
            <AlertDialog.Title>{text.deleteTitle}</AlertDialog.Title>
            <AlertDialog.Description>{text.deleteDescription}</AlertDialog.Description>
            <AlertDialog.Actions>
              <AlertDialog.Close className="kv-button kv-button--danger">
                {text.deleteConfirm}
              </AlertDialog.Close>
              <AlertDialog.Close ref={keepRef} className="kv-button">
                {text.deleteKeep}
              </AlertDialog.Close>
            </AlertDialog.Actions>
          </AlertDialog.Popup>
        </AlertDialog.Root>
        <Button>{text.after}</Button>
      </div>
    </>
  )
}
