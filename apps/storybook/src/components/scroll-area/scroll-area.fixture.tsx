import { ScrollArea } from '@kvirn-ui/react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Components/ScrollArea. Each function is one example, and the story's "Show code"
// prints it (`showSource`).

export interface ScrollAreaTexts {
  feesLabel: string
  feesHeaders: [string, string, string, string, string]
  feesRows: [string, string, string, string, string][]
  shortText: string
  keyboardBefore: string
  keyboardAfter: string
}

const textsEn: ScrollAreaTexts = {
  feesLabel: 'Permit fees for 2026',
  feesHeaders: ['Permit', 'Category', 'Processing time', 'Fee', 'Appeal period'],
  feesRows: [
    ['Building permit', 'Housing', '10 weeks', '12,400 kr', '3 weeks'],
    ['Demolition permit', 'Housing', '6 weeks', '4,200 kr', '3 weeks'],
    ['Change of use', 'Commercial', '8 weeks', '9,800 kr', '3 weeks'],
    ['Sign permit', 'Commercial', '4 weeks', '1,900 kr', '3 weeks'],
    ['Outdoor serving', 'Hospitality', '5 weeks', '2,700 kr', '3 weeks'],
    ['Event permit', 'Culture', '3 weeks', '1,200 kr', '2 weeks'],
  ],
  shortText: 'Three fees, all shown at once: nothing here scrolls.',
  keyboardBefore: 'Before the scroll area',
  keyboardAfter: 'After the scroll area',
}

const textsSv: ScrollAreaTexts = {
  feesLabel: 'Avgifter för tillstånd 2026',
  feesHeaders: ['Tillstånd', 'Kategori', 'Handläggningstid', 'Avgift', 'Överklagandetid'],
  feesRows: [
    ['Bygglov', 'Bostad', '10 veckor', '12 400 kr', '3 veckor'],
    ['Rivningslov', 'Bostad', '6 veckor', '4 200 kr', '3 veckor'],
    ['Ändrad användning', 'Verksamhet', '8 veckor', '9 800 kr', '3 veckor'],
    ['Skyltlov', 'Verksamhet', '4 veckor', '1 900 kr', '3 veckor'],
    ['Uteservering', 'Restaurang', '5 veckor', '2 700 kr', '3 veckor'],
    ['Evenemangstillstånd', 'Kultur', '3 veckor', '1 200 kr', '2 veckor'],
  ],
  shortText: 'Tre avgifter, alla syns på en gång: ingenting här rullar.',
  keyboardBefore: 'Före rullningsytan',
  keyboardAfter: 'Efter rullningsytan',
}

const textsFi: ScrollAreaTexts = {
  feesLabel: 'Lupamaksut 2026',
  feesHeaders: ['Lupa', 'Luokka', 'Käsittelyaika', 'Maksu', 'Valitusaika'],
  feesRows: [
    ['Rakennuslupa', 'Asuminen', '10 viikkoa', '12 400 kr', '3 viikkoa'],
    ['Purkulupa', 'Asuminen', '6 viikkoa', '4 200 kr', '3 viikkoa'],
    ['Käyttötarkoituksen muutos', 'Liiketila', '8 viikkoa', '9 800 kr', '3 viikkoa'],
    ['Kylttilupa', 'Liiketila', '4 viikkoa', '1 900 kr', '3 viikkoa'],
    ['Terassilupa', 'Ravintola', '5 viikkoa', '2 700 kr', '3 viikkoa'],
    ['Tapahtumalupa', 'Kulttuuri', '3 viikkoa', '1 200 kr', '2 viikkoa'],
  ],
  shortText: 'Kolme maksua, kaikki näkyvät kerralla: mikään ei vierity.',
  keyboardBefore: 'Ennen vierityspaneelia',
  keyboardAfter: 'Vierityspaneelin jälkeen',
}

const textsNb: ScrollAreaTexts = {
  feesLabel: 'Gebyrer for tillatelser 2026',
  feesHeaders: ['Tillatelse', 'Kategori', 'Saksbehandlingstid', 'Gebyr', 'Klagefrist'],
  feesRows: [
    ['Byggetillatelse', 'Bolig', '10 uker', '12 400 kr', '3 uker'],
    ['Rivetillatelse', 'Bolig', '6 uker', '4 200 kr', '3 uker'],
    ['Bruksendring', 'Næring', '8 uker', '9 800 kr', '3 uker'],
    ['Skilttillatelse', 'Næring', '4 uker', '1 900 kr', '3 uker'],
    ['Uteservering', 'Servering', '5 uker', '2 700 kr', '3 uker'],
    ['Arrangementstillatelse', 'Kultur', '3 uker', '1 200 kr', '2 uker'],
  ],
  shortText: 'Tre gebyrer, alle vises samtidig: ingenting her ruller.',
  keyboardBefore: 'Før rulleflaten',
  keyboardAfter: 'Etter rulleflaten',
}

const textsNn: ScrollAreaTexts = {
  feesLabel: 'Gebyr for løyve 2026',
  feesHeaders: ['Løyve', 'Kategori', 'Sakshandsamingstid', 'Gebyr', 'Klagefrist'],
  feesRows: [
    ['Byggeløyve', 'Bustad', '10 veker', '12 400 kr', '3 veker'],
    ['Riveløyve', 'Bustad', '6 veker', '4 200 kr', '3 veker'],
    ['Bruksendring', 'Næring', '8 veker', '9 800 kr', '3 veker'],
    ['Skiltløyve', 'Næring', '4 veker', '1 900 kr', '3 veker'],
    ['Uteservering', 'Servering', '5 veker', '2 700 kr', '3 veker'],
    ['Arrangementsløyve', 'Kultur', '3 veker', '1 200 kr', '2 veker'],
  ],
  shortText: 'Tre gebyr, alle vert viste samtidig: ingenting her rullar.',
  keyboardBefore: 'Før rulleflata',
  keyboardAfter: 'Etter rulleflata',
}

const scrollAreaTexts: Record<FormLocale, ScrollAreaTexts | undefined> = {
  sv: textsSv,
  fi: textsFi,
  nb: textsNb,
  nn: textsNn,
  en: textsEn,
}

/** The fixture text in a locale. */
export function scrollAreaTextsFor(locale: FormLocale): {
  text: ScrollAreaTexts
  lang: 'en' | undefined
} {
  const text = scrollAreaTexts[locale]
  return { text: text ?? textsEn, lang: text === undefined ? 'en' : undefined }
}

function FeesRows({ text }: { text: ScrollAreaTexts }) {
  return (
    <table className="kv-table" style={{ minInlineSize: '40rem' }}>
      <thead>
        <tr>
          {text.feesHeaders.map((header) => (
            <th key={header} scope="col">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {text.feesRows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell, index) =>
              index === 0 ? (
                <th key={cell} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={cell}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** A table wider than its box. Name the area with `aria-label` (or `aria-labelledby`). */
export function FeesTable({ locale }: { locale: FormLocale }) {
  const { text, lang } = scrollAreaTextsFor(locale)
  return (
    <ScrollArea aria-label={text.feesLabel} lang={lang} className="kv-story-narrow">
      <FeesRows text={text} />
    </ScrollArea>
  )
}

/** Content that fits is a plain `<div>`: no role, no name, no Tab stop. */
export function FittingArea({ locale }: { locale: FormLocale }) {
  const { text, lang } = scrollAreaTextsFor(locale)
  return (
    <ScrollArea aria-label={text.feesLabel} lang={lang}>
      <p>{text.shortText}</p>
    </ScrollArea>
  )
}

/** `region="always"` names the area as a region whether it scrolls or not. It is a Tab stop only while it scrolls. */
export function AlwaysRegionArea({ locale }: { locale: FormLocale }) {
  const { text, lang } = scrollAreaTextsFor(locale)
  return (
    <ScrollArea aria-label={text.feesLabel} region="always" lang={lang}>
      <p>{text.shortText}</p>
    </ScrollArea>
  )
}

/** A height limit of your own (`max-block-size`) makes the area scroll down as well as sideways. */
export function TallArea({ locale }: { locale: FormLocale }) {
  const { text, lang } = scrollAreaTextsFor(locale)
  return (
    <ScrollArea
      aria-label={text.feesLabel}
      lang={lang}
      className="kv-story-narrow"
      style={{ maxBlockSize: '8rem' }}
    >
      <FeesRows text={text} />
    </ScrollArea>
  )
}

/** A button on each side, so Tab and Shift+Tab are visible: the area is one stop between them. */
export function KeyboardArea({ locale }: { locale: FormLocale }) {
  const { text, lang } = scrollAreaTextsFor(locale)
  return (
    <div className="kv-story-form" lang={lang}>
      <button type="button" className="kv-button">
        {text.keyboardBefore}
      </button>
      <FeesTable locale={locale} />
      <button type="button" className="kv-button">
        {text.keyboardAfter}
      </button>
    </div>
  )
}
