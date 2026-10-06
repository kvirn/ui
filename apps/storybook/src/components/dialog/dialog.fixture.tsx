import { AlertDialog, Button, Combobox, Dialog, Field, Popover, TextInput } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { comboboxTextsFor, municipalities } from '../combobox/combobox.fixture.tsx'
import type { Municipality } from '../combobox/combobox.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Dialog: each function is one example, and the story's "Show code" prints
// it (`showSource`), so it reads the way an adopter writes it. The words are example content, not
// the component's strings (the only one it has is `dialog.close`, an icon-only Close's name). sv,
// fi and en are written; the other locales show the English text, marked lang="en" (3.1.2).

interface DialogTexts {
  phoneTitle: string
  phoneDescription: string
  phoneLabel: string
  save: string
  cancel: string
  termsOpen: string
  termsTitle: string
  termsParagraph: (index: number) => string
  termsRead: string
  receiptOpen: string
  receiptTitle: string
  receiptDescription: string
  closeText: string
  openFromPage: string
  open: string
  closed: string
  lastReason: string
  removeTrigger: string
  removeTitle: string
  removeDescription: string
  removeConfirm: string
  removeKeep: string
  whyTrigger: string
  whyText: string
  textOutside: string
  before: string
  after: string
}

const textsEn: DialogTexts = {
  phoneTitle: 'Change phone number',
  phoneDescription: 'We send a code by text message to confirm the number.',
  phoneLabel: 'Phone number',
  save: 'Save the number',
  cancel: 'Cancel',
  termsOpen: 'Read the terms',
  termsTitle: 'Terms of the e-service',
  termsParagraph: (index) =>
    `Term ${index}: the details you give are only used for your application.`,
  termsRead: 'I have read the terms',
  receiptOpen: 'Show the receipt',
  receiptTitle: 'Your application is sent',
  receiptDescription: 'We have sent a confirmation to your email address.',
  closeText: 'Close',
  openFromPage: 'Open from the page',
  open: 'open',
  closed: 'closed',
  lastReason: 'Last reason',
  removeTrigger: 'Remove the phone number',
  removeTitle: 'Remove the phone number?',
  removeDescription: "You can't undo this. We will not be able to text you.",
  removeConfirm: 'Remove the number',
  removeKeep: 'Keep the number',
  whyTrigger: 'Why do we ask?',
  whyText: 'We send a code by text message to confirm that the number is yours.',
  textOutside: 'Text outside the dialog',
  before: 'Before',
  after: 'After',
}

const dialogTexts: Partial<Record<FormLocale, DialogTexts>> = {
  en: textsEn,
  sv: {
    phoneTitle: 'Ändra telefonnummer',
    phoneDescription: 'Vi skickar en kod med sms för att bekräfta numret.',
    phoneLabel: 'Telefonnummer',
    save: 'Spara numret',
    cancel: 'Avbryt',
    termsOpen: 'Läs villkoren',
    termsTitle: 'Villkor för e-tjänsten',
    termsParagraph: (index) =>
      `Villkor ${index}: uppgifter du lämnar används bara för ditt ärende.`,
    termsRead: 'Jag har läst villkoren',
    receiptOpen: 'Visa kvittot',
    receiptTitle: 'Din ansökan är skickad',
    receiptDescription: 'Vi har skickat en bekräftelse till din e-postadress.',
    closeText: 'Stäng',
    openFromPage: 'Öppna från sidan',
    open: 'öppen',
    closed: 'stängd',
    lastReason: 'Senaste orsak',
    removeTrigger: 'Ta bort telefonnumret',
    removeTitle: 'Vill du ta bort telefonnumret?',
    removeDescription: 'Det går inte att ångra. Vi kan då inte skicka sms till dig.',
    removeConfirm: 'Ta bort numret',
    removeKeep: 'Behåll numret',
    whyTrigger: 'Varför frågar vi?',
    whyText: 'Vi skickar en kod med sms för att bekräfta att numret är ditt.',
    textOutside: 'Text utanför dialogrutan',
    before: 'Före',
    after: 'Efter',
  },
  fi: {
    phoneTitle: 'Muuta puhelinnumeroa',
    phoneDescription: 'Lähetämme tekstiviestillä koodin, jolla vahvistat numeron.',
    phoneLabel: 'Puhelinnumero',
    save: 'Tallenna numero',
    cancel: 'Peruuta',
    termsOpen: 'Lue ehdot',
    termsTitle: 'Sähköisen palvelun ehdot',
    termsParagraph: (index) =>
      `Ehto ${index}: antamiasi tietoja käytetään vain asiasi käsittelyyn.`,
    termsRead: 'Olen lukenut ehdot',
    receiptOpen: 'Näytä kuitti',
    receiptTitle: 'Hakemuksesi on lähetetty',
    receiptDescription: 'Olemme lähettäneet vahvistuksen sähköpostiosoitteeseesi.',
    closeText: 'Sulje',
    openFromPage: 'Avaa sivulta',
    open: 'auki',
    closed: 'kiinni',
    lastReason: 'Viimeisin syy',
    removeTrigger: 'Poista puhelinnumero',
    removeTitle: 'Haluatko poistaa puhelinnumeron?',
    removeDescription: 'Tätä ei voi perua. Emme voi sen jälkeen lähettää sinulle tekstiviestejä.',
    removeConfirm: 'Poista numero',
    removeKeep: 'Säilytä numero',
    whyTrigger: 'Miksi kysymme tätä?',
    whyText: 'Lähetämme tekstiviestillä koodin, jolla varmistamme, että numero on sinun.',
    textOutside: 'Teksti valintaikkunan ulkopuolella',
    before: 'Ennen',
    after: 'Jälkeen',
  },
}

/** The fixture text in a locale, or English with `lang="en"` for the locales without text. */
export function dialogTextsFor(locale: FormLocale) {
  const text = dialogTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? ('en' as const) : undefined }
}

/**
 * A form in a dialog: Save is the primary action and the first in the DOM, Cancel closes with
 * a plain button. Enter in the field submits. The dialog is controlled so Save can close it, and
 * nothing is cleared when it closes (Escape and Cancel keep what was typed).
 */
export function PhoneNumberForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = dialogTextsFor(locale)
  const [open, setOpen] = useState(false)
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="kv-button">{text.phoneTitle}</Dialog.Trigger>
      <Dialog.Popup lang={lang}>
        <Dialog.Title>{text.phoneTitle}</Dialog.Title>
        <Dialog.Close />
        <Dialog.Description>{text.phoneDescription}</Dialog.Description>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setOpen(false)
          }}
        >
          <Dialog.Body>
            <Field.Root required>
              <Field.Label>{text.phoneLabel}</Field.Label>
              <TextInput name="phone" type="tel" autoComplete="tel" />
            </Field.Root>
          </Dialog.Body>
          <Dialog.Actions>
            <Button type="submit" className="kv-button--primary">
              {text.save}
            </Button>
            <Button onClick={() => setOpen(false)}>{text.cancel}</Button>
          </Dialog.Actions>
        </form>
      </Dialog.Popup>
    </Dialog.Root>
  )
}

/**
 * A dialog taller than the screen scrolls inside the popup, so nothing needs a horizontal scroll or
 * a pinned header (2.4.11). The title is the first thing focus meets: with no field in the dialog it
 * takes focus, so the arrow keys scroll from the start. The last action is the primary one here: a
 * read-only dialog ends with its answer.
 */
export function LongTerms({ locale }: { locale: FormLocale }) {
  const { text, lang } = dialogTextsFor(locale)
  return (
    <Dialog.Root>
      <Dialog.Trigger className="kv-button">{text.termsOpen}</Dialog.Trigger>
      <Dialog.Popup lang={lang}>
        <Dialog.Title>{text.termsTitle}</Dialog.Title>
        <Dialog.Body>
          {Array.from({ length: 30 }, (_, index) => (
            <p key={index}>{text.termsParagraph(index + 1)}</p>
          ))}
        </Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close className="kv-button kv-button--primary">{text.termsRead}</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  )
}

/**
 * Controlled by your state: the dialog shows the `open` it is given and reports every request
 * through `onOpenChange(open, { reason, event })`. The trigger, Escape and Close each ask with
 * their own reason. A press on the backdrop asks only with `dismissOnOutsidePress`.
 */
export function ControlledDialog({ locale }: { locale: FormLocale }) {
  const { text, lang } = dialogTextsFor(locale)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('–')
  return (
    <>
      <Button onClick={() => setOpen(true)}>{text.openFromPage}</Button>
      <output data-testid="state">{open ? text.open : text.closed}</output>
      <output data-testid="reason">
        {text.lastReason}: {reason}
      </output>
      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen)
          setReason(details.reason)
        }}
        dismissOnOutsidePress
      >
        <Dialog.Trigger className="kv-button">{text.receiptOpen}</Dialog.Trigger>
        <Dialog.Popup lang={lang}>
          <Dialog.Title>{text.receiptTitle}</Dialog.Title>
          <Dialog.Description>{text.receiptDescription}</Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close className="kv-button kv-button--primary">{text.closeText}</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  )
}

/**
 * A dialog opened by state, with no `Dialog.Trigger`: a timer or a result opens it the same way. It
 * has nowhere obvious to return focus to, so `finalFocusRef` says where it goes.
 */
export function OpenedByAButton({ locale }: { locale: FormLocale }) {
  const { text, lang } = dialogTextsFor(locale)
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <Button ref={buttonRef} onClick={() => setOpen(true)}>
        {text.receiptOpen}
      </Button>
      <Dialog.Root open={open} onOpenChange={setOpen} finalFocusRef={buttonRef}>
        <Dialog.Popup lang={lang}>
          <Dialog.Title>{text.receiptTitle}</Dialog.Title>
          <Dialog.Description>{text.receiptDescription}</Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close className="kv-button kv-button--primary">{text.closeText}</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  )
}

/**
 * An AlertDialog over a Dialog: Escape closes the alert dialog first, and focus returns to the
 * button that opened it. The alert dialog sits inside the dialog's subtree, so the dialog's inert
 * page never reaches it.
 */
export function RemoveNumberOverDialog({ locale }: { locale: FormLocale }) {
  const { text, lang } = dialogTextsFor(locale)
  const keepRef = useRef<HTMLButtonElement>(null)
  return (
    <Dialog.Root>
      <Dialog.Trigger className="kv-button">{text.phoneTitle}</Dialog.Trigger>
      <Dialog.Popup lang={lang}>
        <Dialog.Title>{text.phoneTitle}</Dialog.Title>
        <Dialog.Close />
        <Dialog.Body>
          <AlertDialog.Root initialFocusRef={keepRef}>
            <AlertDialog.Trigger className="kv-button">{text.removeTrigger}</AlertDialog.Trigger>
            <AlertDialog.Popup>
              <AlertDialog.Title>{text.removeTitle}</AlertDialog.Title>
              <AlertDialog.Description>{text.removeDescription}</AlertDialog.Description>
              <AlertDialog.Actions>
                <AlertDialog.Close className="kv-button kv-button--danger">
                  {text.removeConfirm}
                </AlertDialog.Close>
                <AlertDialog.Close ref={keepRef} className="kv-button">
                  {text.removeKeep}
                </AlertDialog.Close>
              </AlertDialog.Actions>
            </AlertDialog.Popup>
          </AlertDialog.Root>
        </Dialog.Body>
      </Dialog.Popup>
    </Dialog.Root>
  )
}

/**
 * A Popover inside a dialog. It stays in the dialog's subtree, so it is not inert, and Escape
 * closes it first. The next Escape closes the dialog.
 */
export function PopoverInDialog({ locale }: { locale: FormLocale }) {
  const { text, lang } = dialogTextsFor(locale)
  return (
    <Dialog.Root>
      <Dialog.Trigger className="kv-button">{text.phoneTitle}</Dialog.Trigger>
      <Dialog.Popup lang={lang}>
        <Dialog.Title>{text.phoneTitle}</Dialog.Title>
        <Dialog.Close />
        <Dialog.Body>
          <Field.Root required>
            <Field.Label>{text.phoneLabel}</Field.Label>
            <TextInput name="phone" type="tel" autoComplete="tel" />
          </Field.Root>
          <Popover.Root>
            <Popover.Trigger className="kv-button">{text.whyTrigger}</Popover.Trigger>
            <Popover.Popup aria-label={text.whyTrigger}>
              <p>{text.whyText}</p>
            </Popover.Popup>
          </Popover.Root>
        </Dialog.Body>
      </Dialog.Popup>
    </Dialog.Root>
  )
}

/**
 * A Combobox inside a dialog. The provider's live regions are inert while a modal is open, so the
 * dialog hosts its own and the result count is still announced. Escape closes the list first.
 */
export function ComboboxInDialog({ locale }: { locale: FormLocale }) {
  const { text, lang } = dialogTextsFor(locale)
  const { text: comboboxText } = comboboxTextsFor(locale)
  return (
    <Dialog.Root>
      <Dialog.Trigger className="kv-button">{text.phoneTitle}</Dialog.Trigger>
      <Dialog.Popup lang={lang}>
        <Dialog.Title>{text.phoneTitle}</Dialog.Title>
        <Dialog.Close />
        <Dialog.Body>
          <Field.Root required>
            <Field.Label>{comboboxText.municipality}</Field.Label>
            <Combobox.Root
              items={municipalities}
              itemToString={(municipality) => municipality.name}
              itemToKey={(municipality) => municipality.code}
              name="municipality"
            >
              <Combobox.Control>
                <Combobox.Input />
                <Combobox.Clear />
                <Combobox.Toggle />
              </Combobox.Control>
              <Combobox.Popup>
                <Combobox.List>
                  {(municipality: Municipality) => <Combobox.Option item={municipality} />}
                </Combobox.List>
                <Combobox.Empty />
              </Combobox.Popup>
            </Combobox.Root>
          </Field.Root>
        </Dialog.Body>
      </Dialog.Popup>
    </Dialog.Root>
  )
}

/**
 * What the keyboard tests drive: a line of text and a button before, the dialog, and a button after.
 * Try the keys in the Keyboard section above: Enter and Space on the trigger, Tab inside, Escape and
 * Close.
 */
export function KeyboardDialog({ locale }: { locale: FormLocale }) {
  const { text, lang } = dialogTextsFor(locale)
  return (
    <>
      <p data-testid="outside">{text.textOutside}</p>
      <div className="kv-button-group">
        <Button>{text.before}</Button>
        <Dialog.Root>
          <Dialog.Trigger className="kv-button">{text.phoneTitle}</Dialog.Trigger>
          <Dialog.Popup lang={lang}>
            <Dialog.Title>{text.phoneTitle}</Dialog.Title>
            <Dialog.Description>{text.phoneDescription}</Dialog.Description>
            <Dialog.Body>
              <Field.Root required>
                <Field.Label>{text.phoneLabel}</Field.Label>
                <TextInput name="phone" type="tel" autoComplete="tel" />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Actions>
              <Dialog.Close className="kv-button kv-button--primary">{text.closeText}</Dialog.Close>
            </Dialog.Actions>
          </Dialog.Popup>
        </Dialog.Root>
        <Button>{text.after}</Button>
      </div>
    </>
  )
}
