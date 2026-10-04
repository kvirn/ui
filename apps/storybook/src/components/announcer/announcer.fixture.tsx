import { Button, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Story fixture for the shared Announcer. The buttons stand in for what a component
// does when something changes: they call `announce`. sv, fi, nb, nn and en are written. se
// shows the English text, marked lang="en" (3.1.2). In a real component these strings
// come from the catalogs; here they are fixture text, so the live region's output is readable.
// The live regions come from the outermost KvirnProvider, which the stories' `withFormLocale`
// decorator renders, like an app's provider would.

type AnnouncerFixtureLocale = 'sv' | 'fi' | 'nb' | 'nn' | 'en'

interface AnnouncerTexts {
  heading: string
  intro: string
  saved: string
  expired: string
  digitsOnly: string
  polite: string
  assertive: string
  repeat: string
  throttled: string
  lastLabel: string
  accepted: string
  dropped: string
  none: string
}

const texts: Record<AnnouncerFixtureLocale, AnnouncerTexts> = {
  sv: {
    heading: 'Meddelanden till skärmläsare',
    intro:
      'Knapparna skickar meddelanden till de dolda live-regionerna. En skärmläsare läser upp dem. Den här listan visar vad som skickades.',
    saved: 'Ändringarna är sparade',
    expired: 'Sessionen har gått ut. Logga in igen.',
    digitsOnly: 'Här kan du bara skriva siffror',
    polite: 'Säg det vänligt',
    assertive: 'Säg det med eftertryck',
    repeat: 'Upprepa samma meddelande',
    throttled: 'Meddelande med nyckel (högst ett var tredje sekund)',
    lastLabel: 'Senaste anropet',
    accepted: 'skickades',
    dropped: 'släpptes (för tätt)',
    none: 'Inget än',
  },
  fi: {
    heading: 'Ilmoitukset ruudunlukijalle',
    intro:
      'Painikkeet lähettävät ilmoituksia piilotettuihin live-alueisiin. Ruudunlukija lukee ne ääneen. Tämä luettelo näyttää, mitä lähetettiin.',
    saved: 'Muutokset on tallennettu',
    expired: 'Istunto on vanhentunut. Kirjaudu uudelleen.',
    digitsOnly: 'Tähän voi kirjoittaa vain numeroita',
    polite: 'Sano se kohteliaasti',
    assertive: 'Sano se painokkaasti',
    repeat: 'Toista sama ilmoitus',
    throttled: 'Ilmoitus avaimella (enintään kerran kolmessa sekunnissa)',
    lastLabel: 'Viimeisin kutsu',
    accepted: 'lähetettiin',
    dropped: 'ohitettiin (liian tiheästi)',
    none: 'Ei vielä mitään',
  },
  nb: {
    heading: 'Meldinger til skjermlesere',
    intro:
      'Knappene sender meldinger til de skjulte live-regionene, og en skjermleser leser dem opp. Denne listen viser hva som ble sendt.',
    saved: 'Endringene er lagret',
    expired: 'Økten har utløpt. Logg inn på nytt.',
    digitsOnly: 'Her kan du bare skrive siffer',
    polite: 'Si det høflig',
    assertive: 'Si det med trykk',
    repeat: 'Gjenta den samme meldingen',
    throttled: 'Melding med nøkkel (høyst én hvert tredje sekund)',
    lastLabel: 'Siste kall',
    accepted: 'ble sendt',
    dropped: 'ble forkastet (for tett)',
    none: 'Ingenting ennå',
  },
  nn: {
    heading: 'Meldingar til skjermlesarar',
    intro:
      'Knappane sender meldingar til dei skjulte live-regionane, og ein skjermlesar les dei opp. Denne lista viser kva som vart sendt.',
    saved: 'Endringane er lagra',
    expired: 'Økta har gått ut. Logg inn på nytt.',
    digitsOnly: 'Her kan du berre skrive siffer',
    polite: 'Sei det høfleg',
    assertive: 'Sei det med trykk',
    repeat: 'Gjenta den same meldinga',
    throttled: 'Melding med nøkkel (høgst ein kvar tredje sekund)',
    lastLabel: 'Siste kall',
    accepted: 'vart sendt',
    dropped: 'vart forkasta (for tett)',
    none: 'Ingenting enno',
  },
  en: {
    heading: 'Messages for screen readers',
    intro:
      'The buttons send messages to the hidden live regions, and a screen reader reads them out. This list shows what was sent.',
    saved: 'Your changes are saved',
    expired: 'Your session has expired. Sign in again.',
    digitsOnly: 'Only digits can be entered here',
    polite: 'Say it politely',
    assertive: 'Say it assertively',
    repeat: 'Repeat the same message',
    throttled: 'Message with a key (at most one every three seconds)',
    lastLabel: 'Latest call',
    accepted: 'sent',
    dropped: 'dropped (too soon)',
    none: 'Nothing yet',
  },
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function announcerTextsFor(locale: FormLocale): {
  text: AnnouncerTexts
  lang: 'en' | undefined
} {
  const known = locale !== 'se'
  return { text: texts[known ? locale : 'en'], lang: known ? undefined : 'en' }
}

interface LastCall {
  message: string
  accepted: boolean
}

/**
 * `useAnnouncer()` gives `announce`, and each button calls it from its click handler with text
 * already resolved from your i18n. A message with a `key` is throttled, and `announce` returns
 * `false` when it drops one. The app's `KvirnProvider` renders the live regions.
 */
export function AnnouncementButtons({ locale }: { locale: FormLocale }) {
  const { text, lang } = announcerTextsFor(locale)
  const { announce } = useAnnouncer()
  const [lastCall, setLastCall] = useState<LastCall | undefined>()

  const say = (message: string, options?: Parameters<typeof announce>[1]) => {
    setLastCall({ message, accepted: announce(message, options) })
  }

  return (
    <div lang={lang}>
      <h2>{text.heading}</h2>
      <p>{text.intro}</p>
      <div className="kv-button-group">
        <Button onClick={() => say(text.saved)}>{text.polite}</Button>
        <Button onClick={() => say(text.expired, { politeness: 'assertive' })}>
          {text.assertive}
        </Button>
        <Button onClick={() => say(text.saved)}>{text.repeat}</Button>
        <Button onClick={() => say(text.digitsOnly, { key: 'phone' })}>{text.throttled}</Button>
      </div>
      <p>
        {text.lastLabel}:{' '}
        <span data-testid="last-call">
          {lastCall === undefined
            ? text.none
            : `${lastCall.message} (${lastCall.accepted ? text.accepted : text.dropped})`}
        </span>
      </p>
    </div>
  )
}
