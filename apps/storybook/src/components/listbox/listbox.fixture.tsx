import { Button, Card, Field, Icon, Listbox } from '@kvirn-ui/react'
import { useMemo, useState } from 'react'
import { choiceTextsFor } from '../form/choice.fixture.tsx'
import type { ChoiceTexts } from '../form/choice.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'
import { virtualizedPlaces } from '../form/virtualized.fixture.ts'
import type { VirtualizedPlace } from '../form/virtualized.fixture.ts'

// Fixtures for Components/Form/Listbox. Each function is one example, and the story's "Show
// code" prints it (`showSource`), so it reads the way an adopter writes it: the real parts and
// props, with the localised text taken at the top. The function child of `Listbox.List` and the
// `itemToString` and `itemToKey` functions are why these are fixtures: Storybook's own snippet
// can't print a function. The popup stories use native="never" so they show the popup on any
// device, and the Native one uses native="always" for the browser's own `<select>`. KvirnUI
// holds no form state and nothing here validates: an invalid example sets `invalid` itself.

export interface Municipality {
  code: string
  name: string
  /** Shown under the name in a rich option. */
  county?: string
  disabled?: boolean
}

/** In the Swedish alphabet: å, ä and ö come last, and typeahead keeps them apart from a and o. */
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

/** Five of them: a list short enough to fit above a trigger. */
export const fewMunicipalities: readonly Municipality[] = municipalities.slice(0, 5)

/** A list with nothing in it, for the empty state. */
export const emptyList: readonly Municipality[] = []

/** One option with a name that wraps in a 320px column, then the first three municipalities. */
export const longNameMunicipalities: readonly Municipality[] = [
  { code: 'long', name: 'Pohjois-Pohjanmaan sairaanhoitopiirin kuntayhtymä' },
  ...municipalities.slice(0, 3),
]

/** What the examples add to the shared fixture text: the list of several, its count, and a custom empty text. */
const extraTexts: Record<
  'sv' | 'en' | 'fi' | 'nb' | 'nn',
  {
    several: string
    severalPlaceholder: string
    selectedCount: (count: number) => string
    noneMessage: string
  }
> = {
  sv: {
    several: 'Kommuner',
    severalPlaceholder: 'Välj kommuner',
    selectedCount: (count) => `${count} kommuner valda`,
    noneMessage: 'Inga kommuner att välja',
  },
  en: {
    several: 'Municipalities',
    severalPlaceholder: 'Choose municipalities',
    selectedCount: (count) => `${count} municipalities chosen`,
    noneMessage: 'No municipalities to choose from',
  },
  fi: {
    several: 'Kunnat',
    severalPlaceholder: 'Valitse kunnat',
    selectedCount: (count) => `${count} kuntaa valittu`,
    noneMessage: 'Ei valittavia kuntia',
  },
  nb: {
    several: 'Kommuner',
    severalPlaceholder: 'Velg kommuner',
    selectedCount: (count) => `${count} kommuner valgt`,
    noneMessage: 'Ingen kommuner å velge mellom',
  },
  nn: {
    several: 'Kommunar',
    severalPlaceholder: 'Vel kommunar',
    selectedCount: (count) => `${count} kommunar valde`,
    noneMessage: 'Ingen kommunar å velje mellom',
  },
}

/** The text of the list of several in a locale (se shows the English text). */
export const extraTextsFor = (locale: FormLocale) => extraTexts[locale === 'se' ? 'en' : locale]

/** Four municipalities in the locale's own words: the native examples' options. The items are memoized, as `Listbox.Root` asks. */
export function useNativeMunicipalities(text: ChoiceTexts): readonly Municipality[] {
  return useMemo(
    () => [
      { code: 'gothenburg', name: text.municipalityGothenburg },
      { code: 'malmo', name: text.municipalityMalmo },
      { code: 'stockholm', name: text.municipalityStockholm },
      { code: 'uppsala', name: text.municipalityUppsala },
    ],
    [text],
  )
}

/** The same four in three regions, for `groups`. Memoized, as `Listbox.Root` asks. */
export function useMunicipalityGroups(text: ChoiceTexts) {
  return useMemo(
    () => [
      {
        key: 'west',
        label: text.regionWest,
        items: [{ code: 'gothenburg', name: text.municipalityGothenburg }],
      },
      {
        key: 'east',
        label: text.regionEast,
        items: [
          { code: 'stockholm', name: text.municipalityStockholm },
          { code: 'uppsala', name: text.municipalityUppsala },
        ],
      },
      {
        key: 'south',
        label: text.regionSouth,
        items: [{ code: 'malmo', name: text.municipalityMalmo }],
      },
    ],
    [text],
  )
}

// The popup ----------------------------------------------------------------------------------

/**
 * The main example: a Listbox in a Field. `Listbox.Root` takes the items and says how to read
 * them, `Listbox.Trigger` is the box that opens the popup, and the function child of
 * `Listbox.List` renders one `Listbox.Option` per item.
 */
export function MunicipalityField() {
  return (
    <Field.Root required>
      <Field.Label>Kommun</Field.Label>
      <Listbox.Root
        native="never"
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        name="municipality"
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder="Välj kommun" />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/**
 * A button, a listbox with a disabled option, a disabled listbox, a listbox of several choices and
 * a button, in a form. `noValidate` keeps the browser's own validation bubbles from replacing your
 * messages.
 */
export function KeyboardForm({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const extra = extraTextsFor(locale)
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <div className="kv-button-group">
        <Button type="button">Före</Button>
      </div>
      <Field.Root required controlId="municipality">
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalitiesWithClosed}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          name="municipality"
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <Field.Root required disabled controlId="closed">
        <Field.Label>{text.longSelectLabel}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="disabled"
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <Field.Root required controlId="several">
        <Field.Label>{extra.several}</Field.Label>
        <Listbox.Root
          native="never"
          multiple
          items={municipalitiesWithClosed}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          name="several"
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={extra.severalPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}

/** A chosen option shows in the closed trigger: `defaultValue` is its key. */
export function SelectedMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue="malmö"
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** Open from the start with `defaultOpen`, with the chosen option marked. */
export function OpenMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue="malmö"
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** The Field's `Field.Prose` is the trigger's description. */
export function MunicipalityWithDescription({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Prose>
        <p>{text.municipalityHint}</p>
      </Field.Prose>
      <Listbox.Root
        native="never"
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** Optional: a Field without `required`. Its label says so, as for every field that isn't required. */
export function OptionalMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** Invalid: `invalid` on the Field, and the message in `Field.ErrorMessage` under the listbox. */
export function InvalidMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required invalid lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Field.Prose>
        <p>{text.municipalityHint}</p>
      </Field.Prose>
      <Listbox.Root
        native="never"
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
      <Field.ErrorMessage>{text.municipalityError}</Field.ErrorMessage>
    </Field.Root>
  )
}

/** Disabled with `disabled` on the Field, which disables the listbox too. */
export function DisabledMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required disabled lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue="malmö"
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** One option that can't be chosen: `isItemDisabled` says which. */
export function MunicipalityWithClosedOption({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={municipalitiesWithClosed}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        isItemDisabled={(municipality) => municipality.disabled === true}
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** Groups: `groups` instead of `items`. Each is a `role="group"` named by its label. */
export function GroupedMunicipalities({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const groups = useMunicipalityGroups(text)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        groups={groups}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: { code: string; name: string }) => (
              <Listbox.Option item={municipality} />
            )}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** Several choices: `multiple`. The popup stays open, each option toggles, and the value is an array of keys. */
export function SeveralMunicipalities({ locale }: { locale: FormLocale }) {
  const { lang } = choiceTextsFor(locale)
  const extra = extraTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{extra.several}</Field.Label>
      <Listbox.Root
        native="never"
        multiple
        items={municipalitiesWithClosed}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        isItemDisabled={(municipality) => municipality.disabled === true}
        defaultValue={['malmö', 'uppsala']}
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={extra.severalPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** A long list scrolls inside the popup, which is never taller than the room that is left. */
export function LongMunicipalityList({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={longList}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** `virtualize` renders only the options in view, for a flat list of thousands. */
export function VirtualizedPlaces({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang} controlId="municipality">
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        virtualize
        items={virtualizedPlaces}
        itemToString={(place) => place.name}
        itemToKey={(place) => place.code}
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(place: VirtualizedPlace) => <Listbox.Option item={place} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/**
 * A rich option with the optional parts: an icon, the text that names the option, a second line
 * that describes it and a mark for the chosen one. The icon and the mark are decorative, so a
 * screen reader reads "Göteborg", then the county as its description.
 */
export function RichMunicipalities({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={richMunicipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => (
              <Listbox.Option item={municipality}>
                <Listbox.OptionIcon>
                  <Icon name="document" />
                </Listbox.OptionIcon>
                <Listbox.OptionText>{municipality.name}</Listbox.OptionText>
                <Listbox.OptionDescription>{municipality.county}</Listbox.OptionDescription>
                <Listbox.OptionIndicator />
              </Listbox.Option>
            )}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/**
 * Your own markup, with none of the parts: any element goes inside `Listbox.Option`, and the name
 * a screen reader reads is its text content. The trigger shows the chosen option's own markup
 * through a function child of `Listbox.Value`.
 */
export function OwnMarkupMunicipalities({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={richMunicipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue="stockholm"
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder}>
            {(chosen: readonly Municipality[]) =>
              chosen.map((municipality) => (
                <span key={municipality.code} style={{ display: 'inline-flex', gap: '0.5rem' }}>
                  <Icon name="document" />
                  {municipality.name}
                </span>
              ))
            }
          </Listbox.Value>
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => (
              <Listbox.Option item={municipality}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon name="document" />
                  <div>
                    <strong>{municipality.name}</strong>
                    <div>{municipality.county}</div>
                  </div>
                </div>
              </Listbox.Option>
            )}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/** No options: `Listbox.Empty` says so in the locale. */
export function NoMunicipalities({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={emptyList}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/**
 * The chosen options as your own text: a function child of `Listbox.Value` gets the chosen items,
 * here to show a count instead of a long list of names. The trigger's name is still the Field's
 * label followed by this text.
 */
export function SeveralMunicipalitiesAsCount({ locale }: { locale: FormLocale }) {
  const { lang } = choiceTextsFor(locale)
  const extra = extraTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{extra.several}</Field.Label>
      <Listbox.Root
        native="never"
        multiple
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue={['malmö', 'uppsala']}
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={extra.severalPlaceholder}>
            {(chosen: readonly Municipality[]) => extra.selectedCount(chosen.length)}
          </Listbox.Value>
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/**
 * Your own empty text: `messages` on the Root replaces the default "Inga resultat" that
 * `Listbox.Empty` shows, for this listbox only. A provider's `messages` change it for every one.
 */
export function MunicipalitiesWithOwnEmptyText({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const extra = extraTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={emptyList}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        messages={{ noResults: extra.noneMessage }}
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/**
 * The popup above the trigger, with your own gap and edge distance: `placement` (a side, then
 * `-start`, `-center` or `-end`), `offset` and `padding` in pixels. It flips to the other side
 * when there is no room, and `data-placement` says which side it is on.
 */
export function MunicipalityPlacedAbove({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={fewMunicipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        placement="top-start"
        offset={12}
        padding={16}
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/**
 * Controlled by your state: the popup shows the `open` it is given, and `onOpenChange(open, { reason })`
 * reports every request to open or close and why. The printed line is the last one. With `open`
 * set, nothing opens or closes until you change it.
 */
export function ControlledOpenMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('–')
  return (
    <div className="kv-story-form" lang={lang}>
      <Button type="button">Före</Button>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          open={open}
          onOpenChange={(nextOpen, details) => {
            setOpen(nextOpen)
            setReason(details.reason)
          }}
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <p className="kv-story-form-output" data-testid="open">
        open: {String(open)}, reason: {reason}
      </p>
    </div>
  )
}

/** In a card: the edge keeps 3:1 against `surface-raised` (1.4.11), and the popup its own edge. */
export function MunicipalityInCard({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Card.Root lang={lang}>
      <Field.Root required invalid>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          defaultOpen
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
        <Field.ErrorMessage>{text.municipalityError}</Field.ErrorMessage>
      </Field.Root>
    </Card.Root>
  )
}

/** Staff density: `kv-compact` on a parent gives 32px options and trigger from 64rem. */
export function CompactMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <div className="kv-compact" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          defaultOpen
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
    </div>
  )
}

/** A long label and a long option wrap in a narrow column: nothing overflows. */
export function LongFinnishMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <Field.Root required lang={lang}>
      <Field.Label>{text.longSelectLabel}</Field.Label>
      <Listbox.Root
        native="never"
        items={longNameMunicipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue="long"
        defaultOpen
      >
        <Listbox.Trigger>
          <Listbox.Value placeholder={text.municipalityPlaceholder} />
        </Listbox.Trigger>
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
          <Listbox.Empty />
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}

/**
 * Controlled: the value lives in this `useState`, where your form library's state would live.
 * The listbox shows the `value` it is given and reports changes through `onValueChange`.
 */
export function ControlledMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const [value, setValue] = useState<string | null>('göteborg')
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          value={value}
          onValueChange={setValue}
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <p className="kv-story-form-output" data-testid="mirror">
        {text.youChose}: {value ?? '–'}
      </p>
    </div>
  )
}

/** A plain `<form>`: no `value` and no handlers. The form's `FormData` has the key by `name` on submit. */
export function PlainFormMunicipality({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
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
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="municipality"
          defaultValue="göteborg"
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
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

/** Every state in one column: described, invalid, optional and disabled. The popup is open on the first. */
export function MunicipalityStates({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Prose>
          <p>{text.municipalityHint}</p>
        </Field.Prose>
        <Listbox.Root
          native="never"
          items={municipalitiesWithClosed.slice(0, 8)}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          isItemDisabled={(municipality) => municipality.disabled === true}
          defaultValue="ale"
          defaultOpen
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
        <Field.ErrorMessage>{text.municipalityError}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
      <Field.Root required disabled>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          defaultValue="malmö"
        >
          <Listbox.Trigger>
            <Listbox.Value placeholder={text.municipalityPlaceholder} />
          </Listbox.Trigger>
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
    </div>
  )
}

// The native select --------------------------------------------------------------------------
// `native="always"` renders the browser's own `<select>`, wired to its Field, from the same
// items. It takes plain text only, so rich options and `Listbox.Empty` don't apply, and the
// open list is the browser's: its keys are native. The option keys are the select's values.

/**
 * The native rendering in a form: nothing chosen (with the `autoComplete` of the question, 1.3.5),
 * one chosen with `defaultValue`, `groups` as `<optgroup>`s, an invalid one with its help text and
 * message, and a disabled one. The examples share a label, so each has its own `name`.
 */
export function NativeMunicipalities({ locale }: { locale: FormLocale }) {
  const { text, lang } = choiceTextsFor(locale)
  const items = useNativeMunicipalities(text)
  const groups = useMunicipalityGroups(text)
  return (
    <form className="kv-story-form" lang={lang} noValidate onSubmit={(e) => e.preventDefault()}>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="always"
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          placeholder={text.municipalityPlaceholder}
          name="municipality"
          autoComplete="address-level2"
        />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="always"
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          placeholder={text.municipalityPlaceholder}
          name="chosen"
          defaultValue="stockholm"
        />
      </Field.Root>
      <Field.Root required>
        <Field.Label>{text.municipality}</Field.Label>
        <Listbox.Root
          native="always"
          groups={groups}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          placeholder={text.municipalityPlaceholder}
          name="grouped"
        />
      </Field.Root>
      <Field.Root required invalid>
        <Field.Label>{text.municipality}</Field.Label>
        <Field.Prose>
          <p>{text.municipalityHint}</p>
        </Field.Prose>
        <Listbox.Root
          native="always"
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          placeholder={text.municipalityPlaceholder}
          name="invalid"
        />
        <Field.ErrorMessage>{text.municipalityError}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root required disabled>
        <Field.Label>{text.longSelectLabel}</Field.Label>
        <Listbox.Root
          native="always"
          items={items}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          placeholder={text.municipalityPlaceholder}
          name="disabled"
          defaultValue="malmo"
        />
      </Field.Root>
      <div className="kv-button-group">
        <Button type="submit" className="kv-button--primary">
          {text.send}
        </Button>
      </div>
    </form>
  )
}
