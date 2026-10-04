import { Autocomplete, Button, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { virtualizedStreets } from '../form/virtualized.fixture.ts'

// Story and e2e fixture for Components/Form/Autocomplete (contract: autocomplete.a11y.md). The
// functions here are the examples the stories show with "Show code": each is one Autocomplete as
// an adopter writes it. sv, en and fi are written, and nb, nn and se show the English text,
// marked lang="en" (3.1.2), until a translator has been through them.
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

/** The one suggestion that can't be picked now: it stays reachable with the arrows. */
export const closedStreet = 'Stora Torget'

export const isClosedStreet = (street: string) => street === closedStreet

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
}

const textsEn: AutocompleteTexts = {
  street: 'Street address',
  hint: 'Start typing and we suggest streets. You can also write your own address.',
  error: 'Enter your street address',
  placeholder: 'For example Storgatan',
  longLabel:
    'The street address where you live according to the tax agency, with the number of the entrance and the apartment',
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
  },
  fi: {
    street: 'Katuosoite',
    hint: 'Aloita kirjoittaminen, niin ehdotamme katuja. Voit myös kirjoittaa oman osoitteesi.',
    error: 'Anna katuosoitteesi',
    placeholder: 'Esimerkiksi Storgatan',
    longLabel:
      'Katuosoite, jossa asut verohallinnon rekisterin mukaan, porraskäytävän ja asunnon numeron kanssa',
  },
}

/** The fixture text in a locale, with the shared form texts, or English with `lang="en"` until it's translated. */
export function autocompleteTextsFor(locale: FormLocale) {
  const { text: shared, lang } = choiceTextsFor(locale)
  return { text: autocompleteTexts[locale] ?? textsEn, shared, lang }
}

interface StreetAutocompleteProps {
  items?: readonly string[]
  /** The input, with a button that opens the list and one that clears it, in one box. */
  withButtons?: boolean
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  filter?: false
  isLoading?: boolean
  placeholder?: string
}

/** An Autocomplete of street names. The popup parts are the same in every story. */
export function StreetAutocomplete({
  items = streets,
  withButtons = true,
  placeholder,
  ...rootProps
}: StreetAutocompleteProps) {
  return (
    <Autocomplete.Root items={items} isItemDisabled={isClosedStreet} {...rootProps}>
      {withButtons ? (
        <Autocomplete.Control>
          <Autocomplete.Input placeholder={placeholder} />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
        </Autocomplete.Control>
      ) : (
        <Autocomplete.Input placeholder={placeholder} />
      )}
      <Autocomplete.Popup>
        <Autocomplete.List>
          {(street: string) => <Autocomplete.Option item={street} />}
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Root>
  )
}

/**
 * An Autocomplete as an adopter writes it: a Field with its label and hint, the input with a
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

/**
 * The fixture the keyboard tests drive: a button, an Autocomplete with a disabled suggestion and
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
        <StreetAutocomplete name="street" />
      </Field.Root>
      <Field.Root disabled controlId="closed">
        <Field.Label>{text.longLabel}</Field.Label>
        <StreetAutocomplete withButtons={false} name="closed" />
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

/** Every state in one column, for the RTL and forced-colours stories. */
export function AutocompleteStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = autocompleteTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <Field.Prose>
          <p>{text.hint}</p>
        </Field.Prose>
        <StreetAutocomplete items={streets.slice(0, 8)} defaultValue="Kung" />
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete />
        <Field.ErrorMessage>{text.error}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete withButtons={false} placeholder={text.placeholder} />
      </Field.Root>
      <Field.Root disabled>
        <Field.Label>{text.street}</Field.Label>
        <StreetAutocomplete defaultValue="Storgatan" />
      </Field.Root>
    </div>
  )
}
