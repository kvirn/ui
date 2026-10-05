import { Autocomplete, Button, Card, Field, Icon } from '@kvirn-ui/react'
import { useState } from 'react'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { virtualizedStreets } from '../form/virtualized.fixture.ts'

// Story fixture for Components/Form/Autocomplete (contract: autocomplete.a11y.md). The
// functions here are the examples the stories show with "Show code": each is one Autocomplete as
// an adopter writes it. sv, en, fi, nb and nn are written, and se shows the English text,
// marked lang="en" (3.1.2).
//
// KvirnUI holds no form state. The value is the text: pass `value` and
// `onValueChange`, or `defaultValue` and `name` for a plain form. Nothing here validates.

/** Street names, with å, ä and ö at the start and in the middle, for the filter and the keys. */
export const streets: readonly string[] = [
  'Storgatan',
  'Stora Torget',
  'Kungsgatan',
  'Kyrkogatan',
  'Drottninggatan',
  'Fabriksgatan',
  'Hamngatan',
  'Järnvägsgatan',
  'Skolgatan',
  'Sjögatan',
  'Parkgatan',
  'Västra Hamngatan',
  'Östra Hamngatan',
  'Älvgatan',
  'Åkerbärsvägen',
  'Björkvägen',
  'Tallvägen',
  'Granvägen',
  'Ekvägen',
  'Bokvägen',
  'Lindvägen',
  'Almvägen',
  'Rönnvägen',
  'Aspvägen',
  'Hasselvägen',
  'Videvägen',
  'Sandvägen',
  'Skogsvägen',
  'Ängsvägen',
  'Öbacken',
]

/** Five of them: a list short enough to fit above the input. */
export const fewStreets: readonly string[] = streets.slice(0, 5)

export const longList: readonly string[] = Array.from(
  { length: 300 },
  (_, index) => `Gata ${index + 1}`,
)

export interface AutocompleteTexts {
  street: string
  hint: string
  error: string
  placeholder: string
  longLabel: string
  /** The help text of an Autocomplete whose own filter matches the start of the name. */
  startsWithHint: string
  /** Your own suggestion count, announced after typing: replaces the built-in "4 resultat". */
  countMessage: (count: number) => string
}

const textsEn: AutocompleteTexts = {
  street: 'Street address',
  hint: 'Start typing and we suggest streets. You can also write your own address.',
  error: 'Enter your street address',
  placeholder: 'For example Storgatan',
  longLabel:
    'The street address where you live according to the tax agency, with the number of the entrance and the apartment',
  startsWithHint: 'The list shows streets that start with what you type.',
  countMessage: (count) => `${count} streets to choose from`,
}

const autocompleteTexts: Partial<Record<FormLocale, AutocompleteTexts>> = {
  en: textsEn,
  sv: {
    street: 'Gatuadress',
    hint: 'Börja skriva så föreslår vi gator. Du kan också skriva en egen adress.',
    error: 'Ange din gatuadress',
    placeholder: 'Till exempel Storgatan',
    longLabel:
      'Gatuadressen där du bor enligt Skatteverkets register, med uppgång och lägenhetsnummer',
    startsWithHint: 'Listan visar gator som börjar med det du skriver.',
    countMessage: (count) => `${count} gator att välja`,
  },
  fi: {
    street: 'Katuosoite',
    hint: 'Aloita kirjoittaminen, niin ehdotamme katuja. Voit myös kirjoittaa oman osoitteesi.',
    error: 'Anna katuosoitteesi',
    placeholder: 'Esimerkiksi Storgatan',
    longLabel:
      'Katuosoite, jossa asut verohallinnon rekisterin mukaan, porraskäytävän ja asunnon numeron kanssa',
    startsWithHint: 'Luettelossa näkyvät kadut, joiden nimi alkaa kirjoittamallasi.',
    countMessage: (count) => `${count} katua valittavana`,
  },
  nb: {
    street: 'Gateadresse',
    hint: 'Begynn å skrive, så foreslår vi gater. Du kan også skrive inn din egen adresse.',
    error: 'Skriv inn gateadressen din',
    placeholder: 'For eksempel Storgatan',
    longLabel: 'Gateadressen der du bor ifølge Folkeregisteret, med oppgang og leilighetsnummer',
    startsWithHint: 'Listen viser gater som begynner med det du skriver.',
    countMessage: (count) => `${count} gater å velge mellom`,
  },
  nn: {
    street: 'Gateadresse',
    hint: 'Byrj å skrive, så føreslår vi gater. Du kan òg skrive inn di eiga adresse.',
    error: 'Skriv inn gateadressa di',
    placeholder: 'Til dømes Storgatan',
    longLabel: 'Gateadressa der du bur ifølgje Folkeregisteret, med oppgang og leilegheitsnummer',
    startsWithHint: 'Lista viser gater som byrjar med det du skriv.',
    countMessage: (count) => `${count} gater å velje mellom`,
  },
}

/** The fixture text in a locale, with the shared form texts, or English with `lang="en"` for se. */
export function autocompleteTextsFor(locale: FormLocale) {
  const { text: shared, lang } = choiceTextsFor(locale)
  return { text: autocompleteTexts[locale] ?? textsEn, shared, lang }
}

/**
 * An Autocomplete as an adopter writes it: a Field with its label and help text, the input with a
 * button that opens the list and one that clears it, and the popup with its suggestions. The value
 * is the text, which may match nothing, and `name` puts it in a plain `<form>`.
 */
export function DefaultExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Autocomplete.Root items={streets} name="street">
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

const richStreets: readonly { name: string; district: string }[] = [
  { name: 'Storgatan', district: 'Centrum' },
  { name: 'Kungsgatan', district: 'Norrmalm' },
  { name: 'Järnvägsgatan', district: 'Station' },
]

/**
 * Suggestions with an icon and a second line: `Autocomplete.OptionIcon`, `OptionText` and
 * `OptionDescription`. Any markup also works in `Autocomplete.Option`, with or without the parts.
 */
export function RichSuggestionsExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root
        items={richStreets}
        itemToString={(street) => street.name}
        itemToKey={(street) => street.name}
      >
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: (typeof richStreets)[number]) => (
              <Autocomplete.Option item={street}>
                <Autocomplete.OptionIcon>
                  <Icon name="document" />
                </Autocomplete.OptionIcon>
                <Autocomplete.OptionText>{street.name}</Autocomplete.OptionText>
                <Autocomplete.OptionDescription>{street.district}</Autocomplete.OptionDescription>
              </Autocomplete.Option>
            )}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/**
 * 10 000 suggestions with `virtualize`: only the suggestions in view, and the active one, are in
 * the page. Each says how big the list is and where it is in it, so a screen reader still knows.
 * Typing narrows the suggestions: the list is virtualized only while it stays long.
 */
export function VirtualizedExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang} controlId="street">
      <Field.Label>{text.street}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Autocomplete.Root virtualize items={virtualizedStreets} name="street">
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** Just the input and the popup, with no box and no buttons: the smallest Autocomplete. */
export function MinimalExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root items={streets} isItemDisabled={(street) => street === 'Stora Torget'}>
        <Autocomplete.Input placeholder={text.placeholder} />
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** A value to begin with: the text shows, and the popup stays closed until the user types or opens it. */
export function WithValueExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root items={streets} defaultValue="Kung">
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** Typing filters the suggestions, and a Field's help text says that the text may be your own. */
export function SuggestionsExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Autocomplete.Root items={streets} isItemDisabled={(street) => street === 'Stora Torget'}>
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** Nothing matches: `Autocomplete.Empty` says so, and the typed text is a fine value. */
export function NoSuggestionsExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root items={streets}>
        <Autocomplete.Input />
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
          <Autocomplete.Empty />
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** Suggestions that a server has chosen: `filter={false}` turns the built-in filter off, and `isLoading` makes `Autocomplete.Empty` say "Laddar resultat". */
export function LoadingExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root items={[]} filter={false} isLoading>
        <Autocomplete.Input />
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
          <Autocomplete.Empty />
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** A disabled suggestion: `isItemDisabled` keeps it reachable with the arrow keys, but it can't be picked. */
export function DisabledSuggestionExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root items={streets} isItemDisabled={(street) => street === 'Stora Torget'}>
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** Invalid: `invalid` on the Field, with the error under the field. The text stays, whatever it is. */
export function InvalidExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root required invalid lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Autocomplete.Root items={streets} isItemDisabled={(street) => street === 'Stora Torget'}>
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
      <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
    </Field.Root>
  )
}

/** Disabled: `disabled` on the Field disables the Autocomplete too, and the popup never opens. */
export function DisabledExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root disabled lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root items={streets} defaultValue="Storgatan">
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** A long list scrolls inside the popup, which is never taller than the room that is left. */
export function LongListExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root items={longList}>
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** Groups: `groups` takes `{ key, label, items }`, and each group is named by its label. */
export function GroupsExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  const groups = [
    { key: 'streets', label: 'Gator', items: ['Storgatan', 'Kungsgatan'] },
    { key: 'roads', label: 'Vägar', items: ['Björkvägen', 'Tallvägen'] },
  ]
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root groups={groups}>
        <Autocomplete.Input />
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** A long label and a long chosen suggestion: both wrap, and nothing overflows. */
export function LongFinnishExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  const items = [
    'Pohjois-Pohjanmaan sairaanhoitopiirin kuntayhtymän vanhustenhuollon palvelukeskus',
    ...streets.slice(0, 3),
  ]
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.longLabel}</Field.Label>
      <Autocomplete.Root items={items} defaultValue="Pohjois">
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11), and the popup its own edge. */
export function OnSurfacesExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Card.Root lang={lang}>
      <Field.Root required invalid>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={streets}>
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
        <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
      </Field.Root>
    </Card.Root>
  )
}

/** Staff density from 64rem: `kv-compact` on an ancestor makes the box and the options 32px high. */
export function CompactExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <div className="kv-compact" lang={lang}>
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={streets}>
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
    </div>
  )
}

/**
 * Your own filter: `filter(item, query)` replaces the built-in one, which matches anywhere in the
 * text and keeps å, ä and ö apart from a and o. This one matches the start of the name. It runs
 * on every keystroke and decides which suggestions stay in the list.
 */
export function StartsWithFilterExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Field.Prose>
        <p>{text.startsWithHint}</p>
      </Field.Prose>
      <Autocomplete.Root
        items={streets}
        filter={(street, query) => street.toLowerCase().startsWith(query.toLowerCase())}
      >
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/**
 * The popup and the text in your state: `open` and `value` are controlled, and `onOpenChange` and
 * `onValueChange` say why each changed (`input`, `selection`, `clear`, `option-press` and more).
 * The two printed lines are the last change of each.
 */
export function ControlledOpenAndTextExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  const [open, setOpen] = useState(false)
  const [openReason, setOpenReason] = useState('–')
  const [value, setValue] = useState('')
  const [valueReason, setValueReason] = useState('–')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root
          items={streets}
          open={open}
          onOpenChange={(nextOpen, details) => {
            setOpen(nextOpen)
            setOpenReason(details.reason)
          }}
          value={value}
          onValueChange={(nextText, details) => {
            setValue(nextText)
            setValueReason(details.reason)
          }}
        >
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <p className="kv-story-form-output" data-testid="open">
        open: {String(open)}, reason: {openReason}
      </p>
      <p className="kv-story-form-output" data-testid="text">
        text: {value}, reason: {valueReason}
      </p>
    </div>
  )
}

/**
 * The popup above the input, with your own gap and edge distance: `placement` (a side, then
 * `-start`, `-center` or `-end`), `offset` and `padding` in pixels. It flips to the other side
 * when there is no room, and `data-placement` says which side it is on.
 */
export function PlacedAboveExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Autocomplete.Root items={fewStreets} placement="top-start" offset={12} padding={16}>
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/**
 * Your own announcement: `messages` replaces the built-in "4 resultat" with your wording (a
 * function gets the count), and `announcementDebounceMilliseconds` is how long after the last
 * keystroke it is said. Nothing is announced while the user types; `0` says it as soon as the
 * list has changed.
 */
export function OwnAnnouncementExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.street}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Autocomplete.Root
        items={streets}
        announcementDebounceMilliseconds={0}
        messages={{ resultCount: ({ count }) => text.countMessage(count) }}
      >
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}

/**
 * Controlled by your form state. This `useState` stands in for TanStack Form, React Hook Form or
 * your own reducer: the Autocomplete shows the `value` it is given and calls `onValueChange` with
 * the text when the user types, picks a suggestion or clears.
 */
export function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = autocompleteTextsFor(locale)
  const [value, setValue] = useState('Kung')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={streets} value={value} onValueChange={setValue}>
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {shared.youChose}: {value === '' ? '–' : value}
      </p>
    </div>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers, only `defaultValue` and `name`. The input carries
 * the `name`, and `FormData` has the text by it on submit. Free text is sent as it is.
 */
export function PlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = autocompleteTextsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('street')
        setSent(typeof value === 'string' ? value : '')
      }}
    >
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={streets} name="street" defaultValue="Storgatan">
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {shared.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {shared.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/**
 * The Keyboard story: a button, an Autocomplete with a disabled suggestion and
 * its two buttons, a disabled Autocomplete, and a submit button in a form that shows what it sent.
 */
export function KeyboardExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = autocompleteTextsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('street')
        setSent(typeof value === 'string' ? value : '')
      }}
    >
      <div className="kv-button-group">
        <Button type="button">Före</Button>
      </div>
      <Field.Root controlId="street">
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root
          items={streets}
          isItemDisabled={(street) => street === 'Stora Torget'}
          name="street"
        >
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <Field.Root disabled controlId="closed">
        <Field.Label>{text.longLabel}</Field.Label>
        <Autocomplete.Root items={streets} name="closed">
          <Autocomplete.Input />
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {shared.send}
        </Button>
      </div>
      {sent === undefined ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {shared.sent}: {sent}
        </p>
      )}
    </form>
  )
}

/**
 * Every state in one column, for the RTL and forced-colours stories: with a value, invalid,
 * with a placeholder and no buttons, and disabled.
 */
export function AutocompleteStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <Field.Prose>
          <p>{text.hint}</p>
        </Field.Prose>
        <Autocomplete.Root
          items={streets.slice(0, 8)}
          isItemDisabled={(street) => street === 'Stora Torget'}
          defaultValue="Kung"
        >
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={streets}>
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
        <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={streets}>
          <Autocomplete.Input placeholder={text.placeholder} />
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <Field.Root disabled>
        <Field.Label>{text.street}</Field.Label>
        <Autocomplete.Root items={streets} defaultValue="Storgatan">
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(street: string) => <Autocomplete.Option item={street} />}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
    </div>
  )
}
