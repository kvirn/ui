import { Button, Combobox, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Story and e2e fixture for Components/Form/Combobox (docs/design/form-fields.md; contract:
// combobox.a11y.md). The functions here are the examples the stories show with "Show code": each
// is one Combobox as an adopter writes it. sv, en and fi are written, and nb, nn and se show the
// English text, marked lang="en" (3.1.2), until a translator has been through them.
//
// KvirnUI holds no form state (ADR-0029, item 0). The value is the chosen option's key: pass
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
  },
}

/** The fixture text in a locale, with the shared form texts, or English with `lang="en"` until it's translated. */
export function comboboxTextsFor(locale: FormLocale) {
  const { text: shared, lang } = choiceTextsFor(locale)
  return { text: comboboxTexts[locale] ?? textsEn, shared, lang }
}

interface MunicipalityComboboxProps {
  items?: readonly Municipality[]
  /** The input, with a button that opens the list and one that clears it, in one box. */
  withButtons?: boolean
  name?: string
  defaultValue?: string | null
  defaultInputValue?: string
  value?: string | null
  onValueChange?: (value: string | null) => void
  filter?: false
  isLoading?: boolean
  defaultOpen?: boolean
}

/** A single-choice Combobox of municipalities. The popup parts are the same in every story. */
export function MunicipalityCombobox({
  items = municipalities,
  withButtons = true,
  ...rootProps
}: MunicipalityComboboxProps) {
  return (
    <Combobox.Root
      items={items}
      itemToString={(municipality) => municipality.name}
      itemToKey={(municipality) => municipality.code}
      isItemDisabled={(municipality) => municipality.disabled === true}
      {...rootProps}
    >
      {withButtons ? (
        <Combobox.Control>
          <Combobox.Input />
          <Combobox.Clear />
          <Combobox.Toggle />
        </Combobox.Control>
      ) : (
        <Combobox.Input />
      )}
      <Combobox.Popup>
        <Combobox.List>
          {(municipality: Municipality) => <Combobox.Option item={municipality} />}
        </Combobox.List>
        <Combobox.Empty />
      </Combobox.Popup>
    </Combobox.Root>
  )
}

interface MunicipalitiesComboboxProps {
  defaultValue?: readonly string[]
  name?: string
  items?: readonly Municipality[]
  /** A button that empties the typed text, in a box with the input. The chosen values stay. */
  withClear?: boolean
}

/** A Combobox of several choices: the chosen values are removable chips before the input. */
export function MunicipalitiesCombobox({
  items = municipalitiesWithClosed,
  withClear = false,
  ...rootProps
}: MunicipalitiesComboboxProps) {
  return (
    <Combobox.Root
      multiple
      items={items}
      itemToString={(municipality) => municipality.name}
      itemToKey={(municipality) => municipality.code}
      isItemDisabled={(municipality) => municipality.disabled === true}
      {...rootProps}
    >
      <Combobox.ValueList />
      {withClear ? (
        <Combobox.Control>
          <Combobox.Input />
          <Combobox.Clear />
        </Combobox.Control>
      ) : (
        <Combobox.Input />
      )}
      <Combobox.Popup>
        <Combobox.List>
          {(municipality: Municipality) => <Combobox.Option item={municipality} />}
        </Combobox.List>
        <Combobox.Empty />
      </Combobox.Popup>
    </Combobox.Root>
  )
}

/**
 * A Combobox as an adopter writes it: a Field with its label and hint, the input with a button
 * that opens the list and one that clears it, and the popup with its options. The value is the
 * municipality's code, and `name` puts it in a plain `<form>`.
 */
export function DefaultExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Description>{text.hint}</Field.Description>
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
 * Several choices: each choice moves out of the field and into the list of chosen values, where
 * every value has a remove button. The popup stays open, so the next choice is a few keys away.
 */
export function MultipleExample({ locale }: { locale: FormLocale }) {
  const { text, lang } = comboboxTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.several}</Field.Label>
      <Field.Description>{text.severalHint}</Field.Description>
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
        <MunicipalityCombobox items={municipalitiesWithClosed} name="municipality" />
      </Field.Root>
      <Field.Root required disabled controlId="closed">
        <Field.Label>{shared.longSelectLabel}</Field.Label>
        <MunicipalityCombobox withButtons={false} name="closed" />
      </Field.Root>
      <Field.Root required controlId="several">
        <Field.Label>{text.several}</Field.Label>
        <MunicipalitiesCombobox name="several" defaultValue={['malmö', 'uppsala']} withClear />
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

/** Every state in one column, for the RTL and forced-colours stories. */
export function ComboboxStates({ locale }: { locale: FormLocale }) {
  const { text, shared, lang } = comboboxTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Description>{text.hint}</Field.Description>
        <MunicipalityCombobox items={municipalitiesWithClosed.slice(0, 8)} defaultValue="ale" />
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{text.municipality}</Field.Label>
        <MunicipalityCombobox />
        <Field.ErrorMessage>{text.notInList}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.several}</Field.Label>
        <MunicipalitiesCombobox defaultValue={['malmö', 'uppsala', 'göteborg']} />
      </Field.Root>
      <Field.Root required disabled>
        <Field.Label>{shared.municipality}</Field.Label>
        <MunicipalityCombobox defaultValue="malmö" />
      </Field.Root>
    </div>
  )
}
