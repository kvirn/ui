import { Button, Field, Switch } from '@kvirn-ui/react'
import { useState } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Form/Switch. Each function is one example, and the story's "Show code"
// prints it (`showSource`), so it reads the way an adopter writes it: the real parts and props,
// with the localised text taken at the top. KvirnUI holds no form state, and nothing here saves
// anywhere: the Controlled example only pretends to. se is English, marked lang="en" (3.1.2).

export interface SwitchTexts {
  smsReminders: string
  smsRemindersHint: string
  emailDecisions: string
  noMobileHint: string
  saveFailed: string
  longLabel: string
  statusOn: string
  statusOff: string
  send: string
  sent: string
}

const textsEn: SwitchTexts = {
  smsReminders: 'Text message reminders',
  smsRemindersHint:
    'We send a text message the day before your appointment. Changes are saved straight away.',
  emailDecisions: 'Decisions by email',
  noMobileHint: 'Add a mobile number in Contact details to use this.',
  saveFailed: 'The setting was not saved. Check your connection and try again.',
  longLabel: 'Reminders by text message and email before every booked appointment',
  statusOn: 'Saved: text message reminders are on',
  statusOff: 'Saved: text message reminders are off',
  send: 'Send in',
  sent: 'Sent',
}

const textsSv: SwitchTexts = {
  smsReminders: 'Påminnelser via sms',
  smsRemindersHint: 'Vi skickar ett sms dagen före din tid. Ändringar sparas direkt.',
  emailDecisions: 'Beslut via e-post',
  noMobileHint: 'Lägg till ett mobilnummer under Kontaktuppgifter för att använda det här.',
  saveFailed: 'Inställningen sparades inte. Kontrollera din anslutning och försök igen.',
  longLabel: 'Påminnelser via sms och e-post före varje bokad tid',
  statusOn: 'Sparat: påminnelser via sms är på',
  statusOff: 'Sparat: påminnelser via sms är av',
  send: 'Skicka in',
  sent: 'Skickat',
}

const textsFi: SwitchTexts = {
  smsReminders: 'Tekstiviestimuistutukset',
  smsRemindersHint:
    'Lähetämme tekstiviestin vastaanottoasi edeltävänä päivänä. Muutokset tallentuvat heti.',
  emailDecisions: 'Päätökset sähköpostiin',
  noMobileHint: 'Lisää matkapuhelinnumero yhteystietoihin, jotta voit käyttää tätä.',
  saveFailed: 'Asetusta ei tallennettu. Tarkista verkkoyhteys ja yritä uudelleen.',
  longLabel: 'Muistutukset tekstiviestinä ja sähköpostina ennen jokaista varattua aikaa',
  statusOn: 'Tallennettu: tekstiviestimuistutukset ovat käytössä',
  statusOff: 'Tallennettu: tekstiviestimuistutukset eivät ole käytössä',
  send: 'Lähetä eteenpäin',
  sent: 'Lähetetty',
}

const textsNb: SwitchTexts = {
  smsReminders: 'Påminnelser på sms',
  smsRemindersHint: 'Vi sender en sms dagen før timen din. Endringer lagres med en gang.',
  emailDecisions: 'Vedtak på e-post',
  noMobileHint: 'Legg til et mobilnummer under Kontaktopplysninger for å bruke dette.',
  saveFailed: 'Innstillingen ble ikke lagret. Sjekk tilkoblingen og prøv igjen.',
  longLabel: 'Påminnelser på sms og e-post før hver bestilte time',
  statusOn: 'Lagret: påminnelser på sms er på',
  statusOff: 'Lagret: påminnelser på sms er av',
  send: 'Send inn',
  sent: 'Sendt',
}

const textsNn: SwitchTexts = {
  smsReminders: 'Påminningar på sms',
  smsRemindersHint: 'Vi sender ein sms dagen før timen din. Endringar vert lagra med ein gong.',
  emailDecisions: 'Vedtak på e-post',
  noMobileHint: 'Legg til eit mobilnummer under Kontaktopplysningar for å bruke dette.',
  saveFailed: 'Innstillinga vart ikkje lagra. Sjekk tilkoplinga og prøv igjen.',
  longLabel: 'Påminningar på sms og e-post før kvar bestilte time',
  statusOn: 'Lagra: påminningar på sms er på',
  statusOff: 'Lagra: påminningar på sms er av',
  send: 'Send inn',
  sent: 'Sendt',
}

const switchTexts: Record<FormLocale, SwitchTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  se: undefined,
  en: textsEn,
}

/** The fixture text in a locale, or the English text with `lang="en"` for se. */
export function switchTextsFor(locale: FormLocale): {
  text: SwitchTexts
  lang: 'en' | undefined
} {
  const text = switchTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

/**
 * Three switches: a plain one, a disabled one with the reason in its help text, and a plain one
 * after it. Tab skips the disabled switch, Space toggles the focused one, and Enter does nothing.
 */
export function KeyboardSettings({ locale }: { locale: FormLocale }) {
  const { text, lang } = switchTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Switch name="sms" />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
      </Field.Root>
      <Field.Root disabled>
        <Switch name="disabled" />
        <Field.Label marker="none">{text.longLabel}</Field.Label>
        <Field.HelpText>{text.noMobileHint}</Field.HelpText>
      </Field.Root>
      <Field.Root>
        <Switch name="email" defaultChecked />
        <Field.Label marker="none">{text.emailDecisions}</Field.Label>
      </Field.Root>
    </div>
  )
}

/**
 * A setting that takes effect at once. This `useState` and the status line stand in for your save
 * call: Switch renders the `checked` it's given and calls `onCheckedChange(checked, { reason:
 * 'input', event })`. The status `<output>` is always mounted, so a screen reader announces its
 * text when it changes (4.1.3). If a save fails, put the previous state back, show the error
 * under the row and announce it through the `Announcer`.
 */
export function SavedAtOnceSetting({ locale }: { locale: FormLocale }) {
  const { text, lang } = switchTextsFor(locale)
  const [checked, setChecked] = useState(false)
  const [status, setStatus] = useState('')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Switch
          name="sms"
          checked={checked}
          onCheckedChange={(next) => {
            setChecked(next)
            setStatus(next ? text.statusOn : text.statusOff)
          }}
        />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
        <Field.HelpText>{text.smsRemindersHint}</Field.HelpText>
      </Field.Root>
      <output className="kv-story-form-output" data-testid="status">
        {status}
      </output>
    </div>
  )
}

/**
 * A plain `<form>`: no `checked` and no handlers. The Switch is uncontrolled, the browser keeps
 * its state, and the form's `FormData` has it by `name` and `value` when it is on. An off switch
 * sends nothing.
 */
export function SettingsForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = switchTextsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      onSubmit={(event) => {
        event.preventDefault()
        const sms = new FormData(event.currentTarget).get('sms')
        setSent(typeof sms === 'string' ? sms : '–')
      }}
    >
      <Field.Root>
        <Switch name="sms" value="sms" />
        <Field.Label marker="none">{text.smsReminders}</Field.Label>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {text.sent}: {sent}
        </p>
      )}
    </form>
  )
}
