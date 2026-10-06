import { Button, ButtonGroup, Dialog, KvirnProvider, useToast } from '@kvirn-ui/react'
import type { ToastVariant } from '@kvirn-ui/react'
import { useState } from 'react'
import { messagesFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Toast: each function is one example, and the story's "Show code" prints
// it (`showSource`), so it reads the way an adopter writes it. The words are example content, not
// the component's strings (its one string is `toast.regionLabel`, the region's name). sv, fi, nb,
// nn and en are written; se shows the English text, marked lang="en" (3.1.2), with the English
// library strings and an English provider, so the region is named in English too.

interface ToastTexts {
  saveSettings: string
  settingsSaved: string
  settingsSavedBody: string
  copyLink: string
  linkCopied: string
  startExport: string
  exportRunning: string
  reportReady: string
  openReport: string
  reportOpened: string
  outcomeLabel: string
  deleteDraft: string
  draftDeleted: string
  undo: string
  restoreDraft: string
  draftLabel: string
  draftKept: string
  draftRemoved: string
  saveDraft: string
  draftSaved: string
  showThree: string
  showTwelve: string
  numbered: (position: number) => string
  dismissAll: string
  allDismissed: string
  showMessages: string
  before: string
  after: string
  openDialog: string
  dialogDescription: string
  saveNumber: string
  showNow: string
  numberSaved: string
  heldMessage: string
  longTitle: string
  longBody: string
}

const textsEn: ToastTexts = {
  saveSettings: 'Save notification settings',
  settingsSaved: 'Notification settings saved.',
  settingsSavedBody: 'The change applies from the next notification.',
  copyLink: 'Copy the link',
  linkCopied: 'Link copied.',
  startExport: 'Start the export',
  exportRunning: 'The export is running. You can keep working.',
  reportReady: 'Your report is ready.',
  openReport: 'Open report',
  reportOpened: 'The report was opened.',
  outcomeLabel: 'Result',
  deleteDraft: 'Delete the draft',
  draftDeleted: 'Draft deleted.',
  undo: 'Undo',
  restoreDraft: 'Restore the draft',
  draftLabel: 'The draft',
  draftKept: 'exists',
  draftRemoved: 'is deleted',
  saveDraft: 'Save the draft',
  draftSaved: 'Draft saved.',
  showThree: 'Show three messages',
  showTwelve: 'Show twelve messages',
  numbered: (position) => `Message ${position}.`,
  dismissAll: 'Close all messages',
  allDismissed: 'All messages are closed.',
  showMessages: 'Show messages',
  before: 'Before',
  after: 'After',
  openDialog: 'Change phone number',
  dialogDescription: 'We send a code by text message to confirm the number.',
  saveNumber: 'Save the number',
  showNow: 'Show a message now',
  numberSaved: 'Phone number saved.',
  heldMessage: 'The message was shown when the dialog closed.',
  longTitle: 'Your application is received and sent on for handling.',
  longBody: 'We will write to you when a decision is made.',
}

const toastTexts: Partial<Record<FormLocale, ToastTexts>> = {
  en: textsEn,
  sv: {
    saveSettings: 'Spara aviseringsinställningar',
    settingsSaved: 'Aviseringsinställningarna är sparade.',
    settingsSavedBody: 'Ändringen gäller från nästa avisering.',
    copyLink: 'Kopiera länken',
    linkCopied: 'Länken har kopierats.',
    startExport: 'Starta exporten',
    exportRunning: 'Exporten pågår. Du kan fortsätta arbeta.',
    reportReady: 'Din rapport är klar.',
    openReport: 'Öppna rapporten',
    reportOpened: 'Rapporten öppnades.',
    outcomeLabel: 'Resultat',
    deleteDraft: 'Ta bort utkastet',
    draftDeleted: 'Utkastet har tagits bort.',
    undo: 'Ångra',
    restoreDraft: 'Återställ utkastet',
    draftLabel: 'Utkastet',
    draftKept: 'finns',
    draftRemoved: 'är borttaget',
    saveDraft: 'Spara utkastet',
    draftSaved: 'Utkastet är sparat.',
    showThree: 'Visa tre meddelanden',
    showTwelve: 'Visa tolv meddelanden',
    numbered: (position) => `Meddelande ${position}.`,
    dismissAll: 'Stäng alla meddelanden',
    allDismissed: 'Alla meddelanden är stängda.',
    showMessages: 'Visa meddelanden',
    before: 'Före',
    after: 'Efter',
    openDialog: 'Ändra telefonnummer',
    dialogDescription: 'Vi skickar en kod med sms för att bekräfta numret.',
    saveNumber: 'Spara numret',
    showNow: 'Visa ett meddelande nu',
    numberSaved: 'Telefonnumret är sparat.',
    heldMessage: 'Meddelandet visades när dialogrutan stängdes.',
    longTitle: 'Din ansökan är mottagen och skickad vidare till handläggning.',
    longBody: 'Vi skriver till dig när ett beslut är fattat.',
  },
  fi: {
    saveSettings: 'Tallenna ilmoitusasetukset',
    settingsSaved: 'Ilmoitusasetukset on tallennettu.',
    settingsSavedBody: 'Muutos tulee voimaan seuraavasta ilmoituksesta.',
    copyLink: 'Kopioi linkki',
    linkCopied: 'Linkki on kopioitu.',
    startExport: 'Aloita vienti',
    exportRunning: 'Vienti on käynnissä. Voit jatkaa työskentelyä.',
    reportReady: 'Raporttisi on valmis.',
    openReport: 'Avaa raportti',
    reportOpened: 'Raportti avattiin.',
    outcomeLabel: 'Tulos',
    deleteDraft: 'Poista luonnos',
    draftDeleted: 'Luonnos on poistettu.',
    undo: 'Kumoa',
    restoreDraft: 'Palauta luonnos',
    draftLabel: 'Luonnos',
    draftKept: 'on olemassa',
    draftRemoved: 'on poistettu',
    saveDraft: 'Tallenna luonnos',
    draftSaved: 'Luonnos on tallennettu.',
    showThree: 'Näytä kolme ilmoitusta',
    showTwelve: 'Näytä kaksitoista ilmoitusta',
    numbered: (position) => `Ilmoitus ${position}.`,
    dismissAll: 'Sulje kaikki ilmoitukset',
    allDismissed: 'Kaikki ilmoitukset on suljettu.',
    showMessages: 'Näytä ilmoitukset',
    before: 'Ennen',
    after: 'Jälkeen',
    openDialog: 'Muuta puhelinnumeroa',
    dialogDescription: 'Lähetämme tekstiviestillä koodin, jolla vahvistat numeron.',
    saveNumber: 'Tallenna numero',
    showNow: 'Näytä ilmoitus nyt',
    numberSaved: 'Puhelinnumero on tallennettu.',
    heldMessage: 'Ilmoitus näytettiin, kun valintaikkuna suljettiin.',
    longTitle: 'Asunnonmuutostyöavustushakemuksesi on vastaanotettu ja siirretty käsittelyyn.',
    longBody: 'Kirjoitamme sinulle, kun päätös on tehty.',
  },
  nb: {
    saveSettings: 'Lagre varslingsinnstillinger',
    settingsSaved: 'Varslingsinnstillingene er lagret.',
    settingsSavedBody: 'Endringen gjelder fra neste varsel.',
    copyLink: 'Kopier lenken',
    linkCopied: 'Lenken er kopiert.',
    startExport: 'Start eksporten',
    exportRunning: 'Eksporten pågår. Du kan fortsette å jobbe.',
    reportReady: 'Rapporten din er klar.',
    openReport: 'Åpne rapporten',
    reportOpened: 'Rapporten ble åpnet.',
    outcomeLabel: 'Resultat',
    deleteDraft: 'Slett utkastet',
    draftDeleted: 'Utkastet er slettet.',
    undo: 'Angre',
    restoreDraft: 'Gjenopprett utkastet',
    draftLabel: 'Utkastet',
    draftKept: 'finnes',
    draftRemoved: 'er slettet',
    saveDraft: 'Lagre utkastet',
    draftSaved: 'Utkastet er lagret.',
    showThree: 'Vis tre meldinger',
    showTwelve: 'Vis tolv meldinger',
    numbered: (position) => `Melding ${position}.`,
    dismissAll: 'Lukk alle meldinger',
    allDismissed: 'Alle meldinger er lukket.',
    showMessages: 'Vis meldinger',
    before: 'Før',
    after: 'Etter',
    openDialog: 'Endre telefonnummer',
    dialogDescription: 'Vi sender en kode med tekstmelding for å bekrefte nummeret.',
    saveNumber: 'Lagre nummeret',
    showNow: 'Vis en melding nå',
    numberSaved: 'Telefonnummeret er lagret.',
    heldMessage: 'Meldingen ble vist da dialogvinduet ble lukket.',
    longTitle: 'Søknaden din er mottatt og sendt videre til saksbehandling.',
    longBody: 'Vi skriver til deg når det er fattet et vedtak.',
  },
  nn: {
    saveSettings: 'Lagre varslingsinnstillingar',
    settingsSaved: 'Varslingsinnstillingane er lagra.',
    settingsSavedBody: 'Endringa gjeld frå neste varsel.',
    copyLink: 'Kopier lenkja',
    linkCopied: 'Lenkja er kopiert.',
    startExport: 'Start eksporten',
    exportRunning: 'Eksporten pågår. Du kan halde fram med å jobbe.',
    reportReady: 'Rapporten din er klar.',
    openReport: 'Opne rapporten',
    reportOpened: 'Rapporten vart opna.',
    outcomeLabel: 'Resultat',
    deleteDraft: 'Slett utkastet',
    draftDeleted: 'Utkastet er sletta.',
    undo: 'Angre',
    restoreDraft: 'Gjenopprett utkastet',
    draftLabel: 'Utkastet',
    draftKept: 'finst',
    draftRemoved: 'er sletta',
    saveDraft: 'Lagre utkastet',
    draftSaved: 'Utkastet er lagra.',
    showThree: 'Vis tre meldingar',
    showTwelve: 'Vis tolv meldingar',
    numbered: (position) => `Melding ${position}.`,
    dismissAll: 'Lukk alle meldingar',
    allDismissed: 'Alle meldingar er lukka.',
    showMessages: 'Vis meldingar',
    before: 'Før',
    after: 'Etter',
    openDialog: 'Endre telefonnummer',
    dialogDescription: 'Vi sender ein kode med tekstmelding for å stadfeste nummeret.',
    saveNumber: 'Lagre nummeret',
    showNow: 'Vis ei melding no',
    numberSaved: 'Telefonnummeret er lagra.',
    heldMessage: 'Meldinga vart vist då dialogvindauget vart lukka.',
    longTitle: 'Søknaden din er motteken og send vidare til saksbehandling.',
    longBody: 'Vi skriv til deg når det er fatta eit vedtak.',
  },
}

/** The fixture text in a locale, or English with `lang="en"` for se, which has none. */
export function toastTextsFor(locale: FormLocale) {
  const text = toastTexts[locale]
  return {
    text: text ?? textsEn,
    lang: text === undefined ? ('en' as const) : undefined,
    providerLocale: text === undefined ? ('en' as const) : locale,
    messages: messagesFor(locale),
  }
}

export interface ToastDemoProps {
  locale?: FormLocale
  limit?: number
  autoDismiss?: boolean | number
  variant?: ToastVariant
  withBody?: boolean
  withAction?: boolean
  focus?: boolean
}

function SaveSettingsButton({
  locale,
  variant,
  withBody,
  withAction,
  focus,
}: Required<Pick<ToastDemoProps, 'locale' | 'variant' | 'withBody' | 'withAction' | 'focus'>>) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  const [outcome, setOutcome] = useState('–')
  return (
    <>
      <Button
        lang={lang}
        onClick={() =>
          toast.show({
            variant,
            title: text.settingsSaved,
            ...(withBody && { body: <p lang={lang}>{text.settingsSavedBody}</p> }),
            ...(withAction && {
              action: { label: text.undo, onPress: () => setOutcome(text.undo) },
            }),
            focus,
          })
        }
      >
        {text.saveSettings}
      </Button>
      <p lang={lang}>
        {text.outcomeLabel}: <output data-testid="outcome">{outcome}</output>
      </p>
    </>
  )
}

/**
 * One button, one toast. The provider takes the `toast` options and renders the region once, in
 * the top layer: nothing is persistent by timer unless `autoDismiss` is set.
 */
export function SaveSettings({
  locale = 'sv',
  limit = 10,
  autoDismiss = false,
  variant = 'success',
  withBody = false,
  withAction = false,
  focus = false,
}: ToastDemoProps) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages} toast={{ limit, autoDismiss }}>
      <SaveSettingsButton
        locale={locale}
        variant={variant}
        withBody={withBody}
        withAction={withAction}
        focus={focus}
      />
    </KvirnProvider>
  )
}

function StatusButtons({ locale }: { locale: FormLocale }) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  return (
    <ButtonGroup lang={lang} aria-label={text.showMessages}>
      <Button onClick={() => toast.show({ variant: 'info', title: text.exportRunning })}>
        {text.startExport}
      </Button>
      <Button onClick={() => toast.show({ variant: 'success', title: text.settingsSaved })}>
        {text.saveSettings}
      </Button>
    </ButtonGroup>
  )
}

/** Info and success, the only two variants: a warning or an error is an inline Alert, never a toast. */
export function StatusToasts({ locale = 'sv' }: { locale?: FormLocale }) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages}>
      <StatusButtons locale={locale} />
    </KvirnProvider>
  )
}

function DeleteDraftButtons({ locale }: { locale: FormLocale }) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  const [deleted, setDeleted] = useState(false)
  return (
    <>
      <p lang={lang}>
        {text.draftLabel}{' '}
        <output data-testid="draft">{deleted ? text.draftRemoved : text.draftKept}</output>
      </p>
      <ButtonGroup lang={lang} aria-label={text.deleteDraft}>
        <Button
          disabled={deleted}
          onClick={() => {
            setDeleted(true)
            toast.show({
              variant: 'success',
              title: text.draftDeleted,
              action: { label: text.undo, onPress: () => setDeleted(false) },
            })
          }}
        >
          {text.deleteDraft}
        </Button>
        {/* Undo also lives on the page: the toast is a shortcut, never the only way back. */}
        <Button disabled={!deleted} onClick={() => setDeleted(false)}>
          {text.restoreDraft}
        </Button>
      </ButtonGroup>
    </>
  )
}

/**
 * A toast with an action is persistent, whatever `autoDismiss` says: the user may need time to
 * reach it. The same undo is on the page, so nothing depends on finding the toast.
 */
export function DeleteDraft({ locale = 'sv' }: { locale?: FormLocale }) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages}>
      <DeleteDraftButtons locale={locale} />
    </KvirnProvider>
  )
}

function TimedButtons({ locale }: { locale: FormLocale }) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  return (
    <ButtonGroup lang={lang} aria-label={text.showMessages}>
      <Button onClick={() => toast.show({ variant: 'success', title: text.linkCopied })}>
        {text.copyLink}
      </Button>
      <Button
        onClick={() =>
          toast.show({
            variant: 'info',
            title: text.reportReady,
            action: { label: text.openReport, onPress: () => {} },
          })
        }
      >
        {text.reportReady}
      </Button>
    </ButtonGroup>
  )
}

/**
 * Timers on. Only a toast without an action can time out, and never before `max(10 s, 100 ms ×
 * characters)`: the timer pauses while the pointer is over the toast, while focus is inside it
 * and while the tab or window is hidden. "Link copied" can time out, and "Your report is ready"
 * has an action, so it stays. Tie `autoDismiss` to a user setting (WCAG 2.2.1).
 */
export function TimedToasts({ locale = 'sv' }: { locale?: FormLocale }) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages} toast={{ autoDismiss: true }}>
      <TimedButtons locale={locale} />
    </KvirnProvider>
  )
}

function StackingButtons({ locale }: { locale: FormLocale }) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  const [outcome, setOutcome] = useState('–')
  return (
    <>
      <ButtonGroup lang={lang} aria-label={text.showMessages}>
        {[3, 12].map((count) => (
          <Button
            key={count}
            onClick={() => {
              for (let position = 1; position <= count; position += 1) {
                toast.show({ variant: 'info', title: text.numbered(position) })
              }
            }}
          >
            {count === 3 ? text.showThree : text.showTwelve}
          </Button>
        ))}
        {/* The same id updates the toast in place: ten saves are one toast. */}
        <Button
          onClick={() =>
            toast.show({ id: 'draft-saved', variant: 'success', title: text.draftSaved })
          }
        >
          {text.saveDraft}
        </Button>
        <Button
          onClick={() => {
            toast.dismissAll()
            setOutcome(text.allDismissed)
          }}
        >
          {text.dismissAll}
        </Button>
      </ButtonGroup>
      <p lang={lang}>
        {text.outcomeLabel}: <output data-testid="outcome">{outcome}</output>
      </p>
    </>
  )
}

/**
 * Every toast shows, up to `limit` (default 10), and the region scrolls. The next one is ignored
 * (`show` returns an empty string and a development warning says why): a persistent toast is never
 * pushed out by a newer one.
 */
export function StackedToasts({ locale = 'sv' }: { locale?: FormLocale }) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages}>
      <StackingButtons locale={locale} />
    </KvirnProvider>
  )
}

function KeyboardButtons({ locale }: { locale: FormLocale }) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  return (
    <ButtonGroup lang={lang} aria-label={text.showMessages}>
      <Button
        onClick={() => {
          toast.show({
            variant: 'success',
            title: text.draftDeleted,
            action: { label: text.undo, onPress: () => {} },
          })
          toast.show({ variant: 'info', title: text.exportRunning })
        }}
      >
        {text.showMessages}
      </Button>
      <Button>{text.after}</Button>
    </ButtonGroup>
  )
}

/**
 * The fixture the keyboard tests drive: a button that shows two toasts and a button after it.
 * Showing moves no focus. Tab goes on after the page into the toasts, oldest first: the action,
 * then Close, then the next toast. Escape inside a toast closes it.
 */
export function KeyboardToasts({ locale = 'sv' }: { locale?: FormLocale }) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages}>
      <KeyboardButtons locale={locale} />
    </KvirnProvider>
  )
}

function EveryToastButton({ locale }: { locale: FormLocale }) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  return (
    <Button
      lang={lang}
      onClick={() => {
        toast.show({
          variant: 'success',
          title: text.settingsSaved,
          body: <p lang={lang}>{text.settingsSavedBody}</p>,
        })
        toast.show({
          variant: 'info',
          title: text.reportReady,
          action: { label: text.openReport, onPress: () => {} },
        })
      }}
    >
      {text.showMessages}
    </Button>
  )
}

/** A success toast with a body and an info toast with an action. */
export function EveryToast({ locale = 'sv' }: { locale?: FormLocale }) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages}>
      <EveryToastButton locale={locale} />
    </KvirnProvider>
  )
}

function LongToastButton({ locale }: { locale: FormLocale }) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  return (
    <Button
      lang={lang}
      onClick={() =>
        toast.show({
          variant: 'info',
          title: text.longTitle,
          body: <p lang={lang}>{text.longBody}</p>,
          action: { label: text.undo, onPress: () => {} },
        })
      }
    >
      {text.showMessages}
    </Button>
  )
}

/** A long title, a body and an action wrap or hyphenate inside the toast and never need a horizontal scroll (1.4.10). */
export function LongToast({ locale = 'fi' }: { locale?: FormLocale }) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages}>
      <LongToastButton locale={locale} />
    </KvirnProvider>
  )
}

function DialogWithToast({ locale }: { locale: FormLocale }) {
  const { text, lang } = toastTextsFor(locale)
  const toast = useToast()
  const [open, setOpen] = useState(false)
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="kv-button" lang={lang}>
        {text.openDialog}
      </Dialog.Trigger>
      <Dialog.Popup lang={lang}>
        <Dialog.Title>{text.openDialog}</Dialog.Title>
        <Dialog.Close />
        <Dialog.Description>{text.dialogDescription}</Dialog.Description>
        <Dialog.Actions>
          <Button
            className="kv-button--primary"
            onClick={() => {
              toast.show({ variant: 'success', title: text.numberSaved })
              setOpen(false)
            }}
          >
            {text.saveNumber}
          </Button>
          {/* While the dialog is open the toast waits: the region would be inert behind it. */}
          <Button onClick={() => toast.show({ variant: 'info', title: text.heldMessage })}>
            {text.showNow}
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  )
}

/**
 * A toast raised while a modal dialog is open is held and shown when the dialog closes, so it is
 * neither inert nor hidden behind the backdrop. Showing it moves no focus: focus returns to the
 * button that opened the dialog.
 */
export function ToastNextToADialog({ locale = 'sv' }: { locale?: FormLocale }) {
  const { providerLocale, messages } = toastTextsFor(locale)
  return (
    <KvirnProvider locale={providerLocale} messages={messages}>
      <DialogWithToast locale={locale} />
    </KvirnProvider>
  )
}

function ShowToastButton({
  label,
  title,
  lang,
}: {
  label: string
  title: string
  lang: 'en' | undefined
}) {
  const toast = useToast()
  return (
    <Button lang={lang} onClick={() => toast.show({ variant: 'success', title })}>
      {label}
    </Button>
  )
}

/**
 * Two providers on one page, such as two micro-frontends: their toasts go to the same list, in
 * one region, and the first provider that mounted sets `limit` and `autoDismiss`.
 */
export function TwoProviders({ locale = 'sv' }: { locale?: FormLocale }) {
  const { text, lang, providerLocale, messages } = toastTextsFor(locale)
  return (
    <>
      <KvirnProvider locale={providerLocale} messages={messages} toast={{ limit: 10 }}>
        <ShowToastButton label={text.saveSettings} title={text.settingsSaved} lang={lang} />
      </KvirnProvider>
      <KvirnProvider locale={providerLocale} messages={messages}>
        <ShowToastButton label={text.copyLink} title={text.linkCopied} lang={lang} />
      </KvirnProvider>
    </>
  )
}
