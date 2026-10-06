import {
  Checkbox,
  CheckboxGroup,
  Field,
  Tag,
  TagGroup,
  useAnnouncer,
  useFormat,
} from '@kvirn-ui/react'
import { useState } from 'react'
import { messagesFor } from '../form/form.fixture.tsx'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/Tag. Each function is one example, and the story's "Show code" prints
// it (`showSource`), so it reads the way an adopter writes it. KvirnUI holds no filter state: the
// `useState` here stands in for your URL or form state. se is English, marked lang="en" (3.1.2).

export interface TagTexts {
  appliedLegend: string
  groupLabel: string
  empty: string
  clearAll: string
  longTag: string
  locked: string
  categoryLegend: string
  yearLegend: string
  categoryName: string
  yearName: string
  categories: Record<'kids' | 'culture' | 'sport', string>
  results: { title: string; category: 'kids' | 'culture' | 'sport'; year: '2024' | '2025' }[]
}

const textsEn: TagTexts = {
  appliedLegend: 'Applied filters',
  groupLabel: 'Languages',
  empty: 'No languages chosen',
  clearAll: 'Clear all languages',
  longTag: 'Municipal environmental and building committee, consultation period',
  locked: 'Required by the service',
  categoryLegend: 'Category',
  yearLegend: 'Year',
  categoryName: 'Category',
  yearName: 'Year',
  categories: { kids: 'Children', culture: 'Culture', sport: 'Sport' },
  results: [
    { title: 'New playground at the library', category: 'kids', year: '2025' },
    { title: 'Summer concerts in the park', category: 'culture', year: '2025' },
    { title: 'Swimming hall opening hours', category: 'sport', year: '2025' },
    { title: 'Children’s theatre autumn programme', category: 'kids', year: '2024' },
    { title: 'Art walk along the river', category: 'culture', year: '2024' },
    { title: 'Football fields booked for the season', category: 'sport', year: '2024' },
  ],
}

const textsSv: TagTexts = {
  appliedLegend: 'Valda filter',
  groupLabel: 'Språk',
  empty: 'Inga språk valda',
  clearAll: 'Rensa alla språk',
  longTag: 'Miljö- och byggnadsnämndens samrådstid för detaljplanen',
  locked: 'Krävs av tjänsten',
  categoryLegend: 'Kategori',
  yearLegend: 'År',
  categoryName: 'Kategori',
  yearName: 'År',
  categories: { kids: 'Barn', culture: 'Kultur', sport: 'Idrott' },
  results: [
    { title: 'Ny lekplats vid biblioteket', category: 'kids', year: '2025' },
    { title: 'Sommarkonserter i parken', category: 'culture', year: '2025' },
    { title: 'Simhallens öppettider', category: 'sport', year: '2025' },
    { title: 'Barnteaterns höstprogram', category: 'kids', year: '2024' },
    { title: 'Konstvandring längs ån', category: 'culture', year: '2024' },
    { title: 'Fotbollsplaner bokade för säsongen', category: 'sport', year: '2024' },
  ],
}

const textsFi: TagTexts = {
  appliedLegend: 'Käytössä olevat suodattimet',
  groupLabel: 'Kielet',
  empty: 'Ei valittuja kieliä',
  clearAll: 'Poista kaikki kielet',
  longTag:
    'Ympäristö- ja rakennuslautakunnan kaavaehdotuksen kuulemisaikaisen käsittelyn määräaika',
  locked: 'Palvelun edellyttämä',
  categoryLegend: 'Luokka',
  yearLegend: 'Vuosi',
  categoryName: 'Luokka',
  yearName: 'Vuosi',
  categories: { kids: 'Lapset', culture: 'Kulttuuri', sport: 'Liikunta' },
  results: [
    { title: 'Uusi leikkipuisto kirjaston viereen', category: 'kids', year: '2025' },
    { title: 'Kesäkonsertit puistossa', category: 'culture', year: '2025' },
    { title: 'Uimahallin aukioloajat', category: 'sport', year: '2025' },
    { title: 'Lastenteatterin syysohjelma', category: 'kids', year: '2024' },
    { title: 'Taidekävely joen varrella', category: 'culture', year: '2024' },
    { title: 'Jalkapallokentät varattu kaudeksi', category: 'sport', year: '2024' },
  ],
}

const textsNb: TagTexts = {
  appliedLegend: 'Valgte filtre',
  groupLabel: 'Språk',
  empty: 'Ingen språk valgt',
  clearAll: 'Fjern alle språk',
  longTag: 'Utvalg for miljø og byggesak, høringsperiode for reguleringsplanen',
  locked: 'Kreves av tjenesten',
  categoryLegend: 'Kategori',
  yearLegend: 'År',
  categoryName: 'Kategori',
  yearName: 'År',
  categories: { kids: 'Barn', culture: 'Kultur', sport: 'Idrett' },
  results: [
    { title: 'Ny lekeplass ved biblioteket', category: 'kids', year: '2025' },
    { title: 'Sommerkonserter i parken', category: 'culture', year: '2025' },
    { title: 'Åpningstider i svømmehallen', category: 'sport', year: '2025' },
    { title: 'Barneteatrets høstprogram', category: 'kids', year: '2024' },
    { title: 'Kunstvandring langs elva', category: 'culture', year: '2024' },
    { title: 'Fotballbaner booket for sesongen', category: 'sport', year: '2024' },
  ],
}

const textsNn: TagTexts = {
  appliedLegend: 'Valde filter',
  groupLabel: 'Språk',
  empty: 'Ingen språk valde',
  clearAll: 'Fjern alle språk',
  longTag: 'Utval for miljø og byggjesak, høyringsperiode for reguleringsplanen',
  locked: 'Krevst av tenesta',
  categoryLegend: 'Kategori',
  yearLegend: 'År',
  categoryName: 'Kategori',
  yearName: 'År',
  categories: { kids: 'Born', culture: 'Kultur', sport: 'Idrett' },
  results: [
    { title: 'Ny leikeplass ved biblioteket', category: 'kids', year: '2025' },
    { title: 'Sommarkonsertar i parken', category: 'culture', year: '2025' },
    { title: 'Opningstider i symjehallen', category: 'sport', year: '2025' },
    { title: 'Barneteatrets haustprogram', category: 'kids', year: '2024' },
    { title: 'Kunstvandring langs elva', category: 'culture', year: '2024' },
    { title: 'Fotballbanar booka for sesongen', category: 'sport', year: '2024' },
  ],
}

const texts: Partial<Record<FormLocale, TagTexts>> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  en: textsEn,
}

/** The fixture text in a locale, or English with `lang="en"` for se. */
export function tagTextsFor(locale: FormLocale): { text: TagTexts; lang: 'en' | undefined } {
  const text = texts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

const textOf = (message: string | (() => string)): string =>
  typeof message === 'function' ? message() : message

const languages = ['Svenska', 'Suomi', 'Norsk']

/**
 * Removable tags. The tags are yours: remove one in `onRemove`, in the same event. The group
 * moves focus to the next remove button, else the previous, else its label, and announces the removal.
 */
export function RemovableTags({ locale }: { locale: FormLocale }) {
  const { text, lang } = tagTextsFor(locale)
  const [chosen, setChosen] = useState(languages)
  return (
    <TagGroup.Root lang={lang}>
      <TagGroup.Label>{text.groupLabel}</TagGroup.Label>
      <TagGroup.List>
        {chosen.map((language) => (
          <Tag.Root key={language}>
            <Tag.Remove
              onRemove={() => setChosen((current) => current.filter((l) => l !== language))}
            >
              {language}
            </Tag.Remove>
          </Tag.Root>
        ))}
      </TagGroup.List>
      <TagGroup.Empty>{text.empty}</TagGroup.Empty>
      <TagGroup.ClearAll onClear={() => setChosen([])}>{text.clearAll}</TagGroup.ClearAll>
    </TagGroup.Root>
  )
}

/** Static tags: text only, not a Tab stop. A locked value is a static tag, never a disabled button. */
export function StaticTags({ locale }: { locale: FormLocale }) {
  const { text, lang } = tagTextsFor(locale)
  return (
    <TagGroup.Root lang={lang}>
      <TagGroup.Label>{text.groupLabel}</TagGroup.Label>
      <TagGroup.List>
        {languages.map((language) => (
          <Tag.Root key={language}>
            <Tag.Label>{language}</Tag.Label>
          </Tag.Root>
        ))}
        <Tag.Root>
          <Tag.Label>{text.locked}</Tag.Label>
        </Tag.Root>
      </TagGroup.List>
    </TagGroup.Root>
  )
}

/** The group with no tag: the list isn't rendered, the empty text is shown and Clear all is gone. */
export function EmptyTags({ locale }: { locale: FormLocale }) {
  const { text, lang } = tagTextsFor(locale)
  return (
    <TagGroup.Root lang={lang}>
      <TagGroup.Label>{text.groupLabel}</TagGroup.Label>
      <TagGroup.List>{[]}</TagGroup.List>
      <TagGroup.Empty>{text.empty}</TagGroup.Empty>
      <TagGroup.ClearAll onClear={() => {}}>{text.clearAll}</TagGroup.ClearAll>
    </TagGroup.Root>
  )
}

/** A long tag wraps over lines, never truncated. */
export function LongTag({ locale }: { locale: FormLocale }) {
  const { text, lang } = tagTextsFor(locale)
  const [visible, setVisible] = useState(true)
  return (
    <TagGroup.Root lang={lang}>
      <TagGroup.Label>{text.groupLabel}</TagGroup.Label>
      <TagGroup.List>
        {visible ? (
          <Tag.Root>
            <Tag.Remove onRemove={() => setVisible(false)}>{text.longTag}</Tag.Remove>
          </Tag.Root>
        ) : null}
        <Tag.Root>
          <Tag.Label>{text.locked}</Tag.Label>
        </Tag.Root>
      </TagGroup.List>
    </TagGroup.Root>
  )
}

/**
 * Filter a list (design: docs/design/tag-and-filters.md). Filters are checkboxes in a form, so
 * they submit without JavaScript. The results update in place, with no Apply button, and the applied
 * filters are tags above the results. The group's own removal message is off
 * (`announceRemoval={false}`) and one message says the removal and the count together, because the
 * live region keeps only the last message. A real list says it after the results settle, debounced.
 */
export function FilterAList({ locale }: { locale: FormLocale }) {
  const { text, lang } = tagTextsFor(locale)
  const { filters } = messagesFor(locale)
  const format = useFormat()
  const { announce } = useAnnouncer()
  const [categories, setCategories] = useState<string[]>(['kids'])
  const [years, setYears] = useState<string[]>(['2025'])

  const countFor = (nextCategories: string[], nextYears: string[]) =>
    text.results.filter(
      (result) =>
        (nextCategories.length === 0 || nextCategories.includes(result.category)) &&
        (nextYears.length === 0 || nextYears.includes(result.year)),
    )
  const results = countFor(categories, years)

  const applied = [
    ...categories.map((value) => ({
      kind: 'category' as const,
      value,
      label: filters.appliedValue(
        { group: text.categoryName, value: text.categories[value as keyof TagTexts['categories']] },
        format,
      ),
    })),
    ...years.map((value) => ({
      kind: 'year' as const,
      value,
      label: filters.appliedValue({ group: text.yearName, value }, format),
    })),
  ]

  const removeFilter = (kind: 'category' | 'year', value: string, label: string) => {
    const nextCategories =
      kind === 'category' ? categories.filter((entry) => entry !== value) : categories
    const nextYears = kind === 'year' ? years.filter((entry) => entry !== value) : years
    setCategories(nextCategories)
    setYears(nextYears)
    announce(
      filters.removedResultCount(
        { label, count: countFor(nextCategories, nextYears).length },
        format,
      ),
    )
  }

  return (
    <div className="kv-story-form" lang={lang}>
      <form aria-labelledby="filter-heading">
        <h2 id="filter-heading">{textOf(filters.heading)}</h2>
        <CheckboxGroup.Root
          name="category"
          value={categories}
          onValueChange={(next) => {
            setCategories(next)
            announce(filters.resultCount({ count: countFor(next, years).length }, format))
          }}
        >
          <CheckboxGroup.Legend>{text.categoryLegend}</CheckboxGroup.Legend>
          {(['kids', 'culture', 'sport'] as const).map((value) => (
            <Field.Root key={value}>
              <Checkbox value={value} />
              <Field.Label>{text.categories[value]}</Field.Label>
            </Field.Root>
          ))}
        </CheckboxGroup.Root>
        <CheckboxGroup.Root
          name="year"
          value={years}
          onValueChange={(next) => {
            setYears(next)
            announce(filters.resultCount({ count: countFor(categories, next).length }, format))
          }}
        >
          <CheckboxGroup.Legend>{text.yearLegend}</CheckboxGroup.Legend>
          {(['2025', '2024'] as const).map((value) => (
            <Field.Root key={value}>
              <Checkbox value={value} />
              <Field.Label>{value}</Field.Label>
            </Field.Root>
          ))}
        </CheckboxGroup.Root>
      </form>
      <TagGroup.Root announceRemoval={false}>
        <TagGroup.Label>{textOf(filters.applied)}</TagGroup.Label>
        <TagGroup.List>
          {applied.map(({ kind, value, label }) => (
            <Tag.Root key={`${kind}-${value}`}>
              <Tag.Remove label={label} onRemove={() => removeFilter(kind, value, label)}>
                {label}
              </Tag.Remove>
            </Tag.Root>
          ))}
        </TagGroup.List>
        <TagGroup.Empty>{textOf(filters.none)}</TagGroup.Empty>
        <TagGroup.ClearAll
          onClear={() => {
            setCategories([])
            setYears([])
            announce(filters.clearedResultCount({ count: text.results.length }, format))
          }}
        />
      </TagGroup.Root>
      <h2 data-testid="count">{filters.resultCount({ count: results.length }, format)}</h2>
      {results.length === 0 ? (
        <>
          <p>{textOf(filters.noResults)}</p>
          <p>{textOf(filters.noResultsHint)}</p>
        </>
      ) : (
        <ol>
          {results.map((result) => (
            <li key={result.title}>{result.title}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
