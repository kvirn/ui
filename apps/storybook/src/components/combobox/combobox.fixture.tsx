import { Button, Card, Combobox, Field, Icon } from '@kvirn-ui/react'
import { useState } from 'react'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { virtualizedPlaces } from '../form/virtualized.fixture.ts'
import type { VirtualizedPlace } from '../form/virtualized.fixture.ts'

// Story fixture for Components/Form/Combobox (docs/design/form-fields.md; contract:
// combobox.a11y.md). The functions here are the examples the stories show with "Show code": each
// is one Combobox as an adopter writes it. sv, en, fi, nb and nn are written, and se shows the
// English text, marked lang="en" (3.1.2).
//
// KvirnUI holds no form state. The value is the chosen option's key: pass
// `value` and `onValueChange`, or `defaultValue` and `name` for a plain form. Nothing here
// validates: an invalid story sets `invalid` itself.

export interface Municipality {
  code: string
  name: string
  /** Shown under the name in a rich option. */
  county?: string
  disabled?: boolean
}

/** In the Swedish alphabet: å, ä and ö come last, and the filter keeps them apart from a and o. */
const names = [
  'Ale',
  'Alingsås',
  'Arvika',
  'Borås',
  'Eskilstuna',
  'Falun',
  'Gävle',
  'Göteborg',
  'Halmstad',
  'Helsingborg',
  'Jönköping',
  'Kalmar',
  'Karlstad',
  'Kiruna',
  'Linköping',
  'Luleå',
  'Lund',
  'Malmö',
  'Norrköping',
  'Oskarshamn',
  'Skellefteå',
  'Stockholm',
  'Sundsvall',
  'Trollhättan',
  'Umeå',
  'Uppsala',
  'Varberg',
  'Västerås',
  'Växjö',
  'Åre',
  'Ängelholm',
  'Örebro',
  'Östersund',
]

export const municipalities: readonly Municipality[] = names.map((name) => ({
  code: name.toLowerCase(),
  name,
}))

/** The same list with one option that can't be chosen now: it stays reachable with the arrows. */
export const municipalitiesWithClosed: readonly Municipality[] = municipalities.map(
  (municipality) =>
    municipality.name === 'Stockholm' ? { ...municipality, disabled: true } : municipality,
)

const counties: Record<string, string> = {
  Göteborg: 'Västra Götaland',
  Malmö: 'Skåne',
  Stockholm: 'Stockholm',
  Uppsala: 'Uppsala',
}

export const richMunicipalities: readonly Municipality[] = Object.entries(counties).map(
  ([name, county]) => ({ code: name.toLowerCase(), name, county }),
)

/** Five of them: a list short enough to fit above the input. */
export const fewMunicipalities: readonly Municipality[] = municipalities.slice(0, 5)

export const longList: readonly Municipality[] = Array.from({ length: 300 }, (_, index) => ({
  code: `ort-${index + 1}`,
  name: `Ort ${index + 1}`,
}))

export interface ComboboxTexts {
  municipality: string
  hint: string
  /** The message under a Combobox whose text matches no option. */
  notInList: string
  several: string
  severalHint: string
  longLabel: string
  groupWest: string
  groupEast: string
  groupSouth: string
  /** The help text of a Combobox whose own filter matches the start of the name. */
  startsWithHint: string
  /** Your own result count, announced after typing: replaces the built-in "4 resultat". */
  countMessage: (count: number) => string
}

const textsEn: ComboboxTexts = {
  municipality: 'Municipality',
  hint: 'Start typing, then choose from the list.',
  notInList: 'Choose a municipality from the list',
  several: 'Municipalities',
  severalHint: 'You can choose several.',
  longLabel:
    'The municipality where you are registered according to the tax agency and where you are applying for the grant',
  groupWest: 'Western Sweden',
  groupEast: 'Eastern Sweden',
  groupSouth: 'Southern Sweden',
  startsWithHint: 'The list shows municipalities that start with what you type.',
  countMessage: (count) => `${count} municipalities to choose from`,
}

const comboboxTexts: Partial<Record<FormLocale, ComboboxTexts>> = {
  en: textsEn,
  sv: {
    municipality: 'Kommun',
    hint: 'Börja skriva och välj sedan i listan.',
    notInList: 'Välj en kommun i listan',
    several: 'Kommuner',
    severalHint: 'Du kan välja flera.',
    longLabel:
      'Kommunen där du är folkbokförd enligt Skatteverkets register och där du ansöker om bidraget',
    groupWest: 'Västsverige',
    groupEast: 'Östra Sverige',
    groupSouth: 'Södra Sverige',
    startsWithHint: 'Listan visar kommuner som börjar med det du skriver.',
    countMessage: (count) => `${count} kommuner att välja`,
  },
  fi: {
    municipality: 'Kunta',
    hint: 'Aloita kirjoittaminen ja valitse sitten luettelosta.',
    notInList: 'Valitse kunta luettelosta',
    several: 'Kunnat',
    severalHint: 'Voit valita useita.',
    longLabel:
      'Kunta, jossa olet kirjoilla verohallinnon rekisterin mukaan ja jossa haet asunnon muutostyön avustusta',
    groupWest: 'Länsi-Ruotsi',
    groupEast: 'Itä-Ruotsi',
    groupSouth: 'Etelä-Ruotsi',
    startsWithHint: 'Luettelossa näkyvät kunnat, joiden nimi alkaa kirjoittamallasi.',
    countMessage: (count) => `${count} kuntaa valittavana`,
  },
  nb: {
    municipality: 'Kommune',
    hint: 'Begynn å skrive, og velg deretter fra listen.',
    notInList: 'Velg en kommune fra listen',
    several: 'Kommuner',
    severalHint: 'Du kan velge flere.',
    longLabel:
      'Kommunen der du er folkeregistrert ifølge Folkeregisteret, og der du søker om tilskuddet',
    groupWest: 'Vest-Sverige',
    groupEast: 'Øst-Sverige',
    groupSouth: 'Sør-Sverige',
    startsWithHint: 'Listen viser kommuner som begynner med det du skriver.',
    countMessage: (count) => `${count} kommuner å velge mellom`,
  },
  nn: {
    municipality: 'Kommune',
    hint: 'Byrj å skrive, og vel deretter frå lista.',
    notInList: 'Vel ei kommune frå lista',
    several: 'Kommunar',
    severalHint: 'Du kan velje fleire.',
    longLabel:
      'Kommunen der du er folkeregistrert ifølgje Folkeregisteret, og der du søkjer om tilskotet',
    groupWest: 'Vest-Sverige',
    groupEast: 'Aust-Sverige',
    groupSouth: 'Sør-Sverige',
    startsWithHint: 'Lista viser kommunar som byrjar med det du skriv.',
    countMessage: (count) => `${count} kommunar å velje mellom`,
  },
}

/** The fixture text in a locale, with the shared form texts, or English with `lang="en"` for se. */
export function comboboxTextsFor(locale: FormLocale) {
  const { text: shared, lang } = choiceTextsFor(locale)
  return { text: comboboxTexts[locale] ?? textsEn, shared, lang }
}

/**
 * A Combobox as an adopter writes it: a Field with its label and help text, the input with a button
 * that opens the list and one that clears it, and the popup with its options. The value is the
 * municipality's code, and `name` puts it in a plain `<form>`.
 */
export function DefaultExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
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
  )
}

/**
 * 10 000 options with `virtualize`: only the options in view, and the active and chosen one, are in
 * the page. Each says how big the list is and where it is in it, so a screen reader still knows.
 * The user types to filter first: the list is virtualized only while it stays long.
 */
export function VirtualizedExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang} controlId="municipality">
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Combobox.Root
        virtualize
        items={virtualizedPlaces}
        itemToString={(place) => place.name}
        itemToKey={(place) => place.code}
        name="municipality"
      >
        <Combobox.Control>
          <Combobox.Input />
          <Combobox.Clear />
          <Combobox.Toggle />
        </Combobox.Control>
        <Combobox.Popup>
          <Combobox.List>
            {(place: VirtualizedPlace) => <Combobox.Option item={place} />}
          </Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}

/**
 * Several choices: each choice moves out of the field and into the list of chosen values, where
 * every value has a remove button. The popup stays open, so the next choice is a few keys away.
 */
export function MultipleExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.several}</Field.Label>
      <Field.Prose>
        <p>{text.severalHint}</p>
      </Field.Prose>
      <Combobox.Root
        multiple
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue={['malmö', 'uppsala']}
        name="municipalities"
      >
        <Combobox.ValueList />
        <Combobox.Input />
        <Combobox.Popup>
          <Combobox.List>
            {(municipality: Municipality) => <Combobox.Option item={municipality} />}
          </Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}

/** Just the input and the popup, with no box and no buttons: the smallest Combobox. */
export function MinimalExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
      >
        <Combobox.Input />
        <Combobox.Popup>
          <Combobox.List>
            {(municipality: Municipality) => <Combobox.Option item={municipality} />}
          </Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}

/** A chosen option shows its text in the input: `defaultValue` is the option's key. */
export function SelectedExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue="malmö"
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
  )
}

/**
 * Typing filters the list, and a Field's help text says so before the user types. When nothing
 * matches, `Combobox.Empty` says so and the typed text stays.
 */
export function FilteringExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
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
  )
}

/**
 * Results that a server has filtered: `filter={false}` turns the built-in filter off, and
 * `isLoading` makes `Combobox.Empty` say "Laddar resultat" while the fetch is running.
 */
export function LoadingExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  const results: Municipality[] = []
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        items={results}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        filter={false}
        isLoading
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
  )
}

/** Items in named groups: `groups` takes `{ key, label, items }`, and each group is named by its label. */
export function GroupsExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  const pick = (...picked: string[]) =>
    municipalities.filter((municipality) => picked.includes(municipality.name))
  const groups = [
    { key: 'west', label: text.groupWest, items: pick('Göteborg', 'Borås') },
    { key: 'east', label: text.groupEast, items: pick('Stockholm', 'Uppsala') },
    { key: 'south', label: text.groupSouth, items: pick('Malmö') },
  ]
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        groups={groups}
        itemToString={(municipality: Municipality) => municipality.name}
        itemToKey={(municipality: Municipality) => municipality.code}
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
  )
}

/** A disabled option: `isItemDisabled` keeps it reachable with the arrow keys, but it can't be chosen. */
export function DisabledOptionExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        items={municipalitiesWithClosed}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        isItemDisabled={(municipality) => municipality.disabled === true}
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
  )
}

/**
 * Invalid: `invalid` on the Field, with the error under the field. The text that matched nothing
 * stays, so the user can fix it instead of starting over.
 */
export function InvalidExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required invalid lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultInputValue="Gö"
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
      <Field.ErrorMessage>{text.notInList}</Field.ErrorMessage>
    </Field.Root>
  )
}

/** Disabled: `disabled` on the Field disables the Combobox too, and the popup never opens. */
export function DisabledExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required disabled lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue="malmö"
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
  )
}

/** Several choices, none chosen yet: the first choice appears as a chip before the input. */
export function MultipleNoneChosenExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.several}</Field.Label>
      <Field.Prose>
        <p>{text.severalHint}</p>
      </Field.Prose>
      <Combobox.Root
        multiple
        items={municipalitiesWithClosed}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        isItemDisabled={(municipality) => municipality.disabled === true}
      >
        <Combobox.ValueList />
        <Combobox.Input />
        <Combobox.Popup>
          <Combobox.List>
            {(municipality: Municipality) => <Combobox.Option item={municipality} />}
          </Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}

/** Several choices with one chosen: a chip with its remove button. Removing it moves focus to the input. */
export function MultipleOneChosenExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.several}</Field.Label>
      <Combobox.Root
        multiple
        items={municipalitiesWithClosed}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        isItemDisabled={(municipality) => municipality.disabled === true}
        defaultValue={['malmö']}
      >
        <Combobox.ValueList />
        <Combobox.Input />
        <Combobox.Popup>
          <Combobox.List>
            {(municipality: Municipality) => <Combobox.Option item={municipality} />}
          </Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}

/** A long list scrolls inside the popup, which is never taller than the room that is left. */
export function LongListExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        items={longList}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
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
  )
}

/**
 * Your own filter: `filter(item, query)` replaces the built-in one, which matches anywhere in the
 * text and keeps å, ä and ö apart from a and o. This one matches the start of the name. It runs
 * on every keystroke and decides which options stay in the list.
 */
export function StartsWithFilterExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Prose>
        <p>{text.startsWithHint}</p>
      </Field.Prose>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        filter={(municipality, query) =>
          municipality.name.toLowerCase().startsWith(query.toLowerCase())
        }
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
  )
}

/**
 * The popup and the text in your state: `open` and `inputValue` are controlled, and
 * `onOpenChange` and `onInputValueChange` say why each changed (`input`, `option-press`,
 * `selection`, `clear` and more). The two printed lines are the last change of each.
 */
export function ControlledOpenAndTextExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  const [open, setOpen] = useState(false)
  const [openReason, setOpenReason] = useState('–')
  const [inputValue, setInputValue] = useState('')
  const [inputReason, setInputReason] = useState('–')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          open={open}
          onOpenChange={(nextOpen, details) => {
            setOpen(nextOpen)
            setOpenReason(details.reason)
          }}
          inputValue={inputValue}
          onInputValueChange={(nextText, details) => {
            setInputValue(nextText)
            setInputReason(details.reason)
          }}
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
      <p className="kv-story-form-output" data-testid="open">
        open: {String(open)}, reason: {openReason}
      </p>
      <p className="kv-story-form-output" data-testid="text">
        text: {inputValue}, reason: {inputReason}
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
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        items={fewMunicipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        placement="top-start"
        offset={12}
        padding={16}
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
  )
}

/**
 * Your own announcement: `messages` replaces the built-in "4 resultat" with your wording (a
 * function gets the count), and `announcementDebounceMilliseconds` is how long after the last
 * keystroke it is said. Nothing is announced while the user types; `0` says it as soon as the
 * list has changed.
 */
export function OwnAnnouncementExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Prose>
        <p>{text.hint}</p>
      </Field.Prose>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        announcementDebounceMilliseconds={0}
        messages={{ resultCount: ({ count }) => text.countMessage(count) }}
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
  )
}

/**
 * A rich option: an icon, the text that names the option and a second line that describes it.
 * Any markup also works in `Combobox.Option`, with or without the parts.
 */
export function RichOptionsExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Combobox.Root
        items={richMunicipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
      >
        <Combobox.Input />
        <Combobox.Popup>
          <Combobox.List>
            {(municipality: Municipality) => (
              <Combobox.Option item={municipality}>
                <Combobox.OptionIcon>
                  <Icon name="document" />
                </Combobox.OptionIcon>
                <Combobox.OptionText>{municipality.name}</Combobox.OptionText>
                <Combobox.OptionDescription>{municipality.county}</Combobox.OptionDescription>
                <Combobox.OptionIndicator />
              </Combobox.Option>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}

/** A long label and a long chosen option, one and several choices: both wrap, and nothing overflows. */
export function LongFinnishExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = comboboxTextsFor(locale)
  const items: readonly Municipality[] = [
    { code: 'long', name: 'Pohjois-Pohjanmaan sairaanhoitopiirin kuntayhtymä' },
    ...municipalities.slice(0, 3),
  ]
  return (
    <>
      <Field.Root required lang={lang}>
        <Field.Label>{text.longLabel}</Field.Label>
        <Combobox.Root
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          defaultValue="long"
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
      <Field.Root required lang={lang}>
        <Field.Label>{shared.longSelectLabel}</Field.Label>
        <Combobox.Root
          multiple
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          defaultValue={['long', 'ale']}
        >
          <Combobox.ValueList />
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => <Combobox.Option item={municipality} />}
            </Combobox.List>
            <Combobox.Empty />
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>
    </>
  )
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11), and the popup its own edge. */
export function OnSurfacesExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Card.Root lang={lang}>
      <Field.Root required invalid>
        <Field.Label>{text.municipality}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
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
        <Field.ErrorMessage>{text.notInList}</Field.ErrorMessage>
      </Field.Root>
    </Card.Root>
  )
}

/** Staff density from 64rem: `kv-compact` on an ancestor makes the box and the options 32px high. */
export function CompactExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <div className="kv-compact" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
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
    </div>
  )
}

/**
 * Controlled by your form state. This `useState` stands in for TanStack Form, React Hook Form or
 * your own reducer: the Combobox shows the `value` it is given and calls `onValueChange` with the
 * chosen key, or `null` when the text no longer names the chosen option.
 */
export function ControlledExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = comboboxTextsFor(locale)
  const [value, setValue] = useState<string | null>('göteborg')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          value={value}
          onValueChange={setValue}
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
      <p className="kv-story-form-output" data-testid="mirror">
        {shared.youChose}: {value ?? '–'}
      </p>
    </div>
  )
}

/**
 * A plain `<form>`: no `value` and no handlers, only `defaultValue` and `name`. The hidden input
 * carries the key, and `FormData` has it by `name` on submit. The typed text is never sent.
 */
export function PlainFormExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = comboboxTextsFor(locale)
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('municipality')
        setSent(typeof value === 'string' ? value : '')
      }}
    >
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="municipality"
          defaultValue="göteborg"
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
 * The fixture the keyboard tests drive: a button, a Combobox with a disabled option and its two
 * buttons, a disabled Combobox, a Combobox of several choices with two values chosen, and a
 * submit button in a form that counts its submissions.
 */
export function KeyboardExample({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = comboboxTextsFor(locale)
  const [submissions, setSubmissions] = useState(0)
  return (
    <form
      className="kv-story-form"
      lang={lang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setSubmissions((count) => count + 1)
      }}
    >
      <div className="kv-button-group">
        <Button type="button">Före</Button>
      </div>
      <Field.Root required controlId="municipality">
        <Field.Label>{text.municipality}</Field.Label>
        <Combobox.Root
          items={municipalitiesWithClosed}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
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
      <Field.Root required disabled controlId="closed">
        <Field.Label>{shared.longSelectLabel}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="closed"
        >
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => <Combobox.Option item={municipality} />}
            </Combobox.List>
            <Combobox.Empty />
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>
      <Field.Root required controlId="several">
        <Field.Label>{text.several}</Field.Label>
        <Combobox.Root
          multiple
          items={municipalitiesWithClosed}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          name="several"
          defaultValue={['malmö', 'uppsala']}
        >
          <Combobox.ValueList />
          <Combobox.Control>
            <Combobox.Input />
            <Combobox.Clear />
          </Combobox.Control>
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => <Combobox.Option item={municipality} />}
            </Combobox.List>
            <Combobox.Empty />
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {shared.send}
        </Button>
      </div>
      {submissions === 0 ? null : (
        <p className="kv-story-form-output" data-testid="sent">
          {shared.sent}: {submissions}
        </p>
      )}
    </form>
  )
}

/**
 * Every state in one column, for the RTL and forced-colours stories: a chosen option, invalid,
 * several choices, and disabled.
 */
export function ComboboxStates({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = comboboxTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Prose>
          <p>{text.hint}</p>
        </Field.Prose>
        <Combobox.Root
          items={municipalitiesWithClosed.slice(0, 8)}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          defaultValue="ale"
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
      <Field.Root required invalid>
        <Field.Label>{text.municipality}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
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
        <Field.ErrorMessage>{text.notInList}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.several}</Field.Label>
        <Combobox.Root
          multiple
          items={municipalitiesWithClosed}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          defaultValue={['malmö', 'uppsala', 'göteborg']}
        >
          <Combobox.ValueList />
          <Combobox.Input />
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => <Combobox.Option item={municipality} />}
            </Combobox.List>
            <Combobox.Empty />
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>
      <Field.Root required disabled>
        <Field.Label>{shared.municipality}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          defaultValue="malmö"
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
    </div>
  )
}
