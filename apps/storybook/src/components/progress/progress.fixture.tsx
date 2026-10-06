import { Alert, Button, Progress } from '@kvirn-ui/react'
import { useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Progress. Each function is one example, and the story's "Show code"
// prints it, so it reads the way an adopter writes it. Nothing here calls a server: the send
// "takes" as long as the timers say. se is English, marked lang="en" (3.1.2).

export interface ProgressTexts {
  sending: string
  send: string
  cancel: string
  exporting: string
  longLabel: string
  failed: string
  retry: string
}

const textsEn: ProgressTexts = {
  sending: 'Sending your application.',
  send: 'Send application',
  cancel: 'Cancel',
  exporting: 'Exporting your cases.',
  longLabel: 'Sending your application for a building permit and the attached drawings.',
  failed: 'We could not send your application.',
  retry: 'Try again',
}

const textsSv: ProgressTexts = {
  sending: 'Skickar din ansökan.',
  send: 'Skicka ansökan',
  cancel: 'Avbryt',
  exporting: 'Exporterar dina ärenden.',
  longLabel: 'Skickar din ansökan om bygglov och de bifogade ritningarna.',
  failed: 'Vi kunde inte skicka din ansökan.',
  retry: 'Försök igen',
}

const textsFi: ProgressTexts = {
  sending: 'Lähetetään hakemustasi.',
  send: 'Lähetä hakemus',
  cancel: 'Peruuta',
  exporting: 'Viedään asioitasi.',
  longLabel: 'Lähetetään rakennuslupahakemustasi ja siihen liitettyjä piirustuksia.',
  failed: 'Hakemuksen lähettäminen ei onnistunut.',
  retry: 'Yritä uudelleen',
}

const textsNb: ProgressTexts = {
  sending: 'Sender søknaden din.',
  send: 'Send søknad',
  cancel: 'Avbryt',
  exporting: 'Eksporterer sakene dine.',
  longLabel: 'Sender byggesøknaden din og de vedlagte tegningene.',
  failed: 'Vi kunne ikke sende søknaden din.',
  retry: 'Prøv igjen',
}

const textsNn: ProgressTexts = {
  sending: 'Sender søknaden din.',
  send: 'Send søknad',
  cancel: 'Avbryt',
  exporting: 'Eksporterer sakene dine.',
  longLabel: 'Sender byggesøknaden din og dei vedlagde teikningane.',
  failed: 'Vi kunne ikkje sende søknaden din.',
  retry: 'Prøv igjen',
}

const progressTexts: Record<FormLocale, ProgressTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function progressTextsFor(locale: FormLocale): {
  text: ProgressTexts
  lang: 'en' | undefined
} {
  const text = progressTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

/**
 * The pattern for a long action: the Button is `busy` (focus stays, every press is blocked) and
 * a Progress sits right after it. It is hidden for the first second and announced once. On
 * failure the Progress goes, an Alert takes its place and `busy` turns off.
 */
export function SendApplication({
  locale,
  succeedAfterMilliseconds = 3000,
  fail = false,
}: {
  locale: FormLocale
  succeedAfterMilliseconds?: number
  fail?: boolean
}) {
  const { text, lang } = progressTextsFor(locale)
  const [state, setState] = useState<'idle' | 'sending' | 'failed'>('idle')

  const send = () => {
    setState('sending')
    setTimeout(() => setState(fail ? 'failed' : 'idle'), succeedAfterMilliseconds)
  }

  return (
    <div lang={lang}>
      <div className="kv-button-group">
        <Button className="kv-button--primary" busy={state === 'sending'} onClick={send}>
          {text.send}
        </Button>
        {state === 'sending' ? (
          <Progress.Root label={text.sending}>
            <Progress.Label />
          </Progress.Root>
        ) : null}
      </div>
      {state === 'failed' ? (
        <Alert.Danger announce="polite">
          <Alert.Title>{text.failed}</Alert.Title>
        </Alert.Danger>
      ) : null}
    </div>
  )
}
