import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties, ReactNode } from 'react'
import { expect, within } from 'storybook/test'
import {
  FoundationPage,
  ScrollTable,
  readLength,
  readProperty,
  useLiveValue,
} from './foundation-helpers.tsx'
import { articleFor } from './foundations.fixture.tsx'
import type { FixtureLocale } from './foundations.fixture.tsx'
import { caseNumberSample, fixtureLocaleOf } from './typography-helpers.tsx'

// Foundation/Typography (docs/design/foundations-and-prose.md §6.6): every type role, rendered
// in its own tokens and with its values read live from the page, then the font families, the
// glyphs a font must cover and the tabular figures, one story each. The samples are fixture
// text in the toolbar locale; the pages around them are English maintainer text.

type ArticleText = ReturnType<typeof articleFor>['text']

/** Which family a role is set in: headings, body text, or mono for code. */
type RoleFamily = 'heading' | 'body' | 'mono'

interface TypeRole {
  role: string
  label: string
  family?: RoleFamily
  sample: (text: ArticleText, formatNumber: (value: number) => string) => string
}

/** The roles in DESIGN.md's order, largest first. `lead` is from ADR-0018. */
const typeRoles: readonly TypeRole[] = [
  { role: 'display', label: 'display', family: 'heading', sample: (text) => text.title },
  { role: 'heading-1', label: 'heading-1', family: 'heading', sample: (text) => text.title },
  {
    role: 'heading-2',
    label: 'heading-2',
    family: 'heading',
    sample: (text) => text.who.heading,
  },
  {
    role: 'heading-3',
    label: 'heading-3',
    family: 'heading',
    sample: (text) => text.attach.heading,
  },
  { role: 'lead', label: 'lead', sample: (text) => text.how.quoteSteps[0] },
  { role: 'body-large', label: 'body-large', sample: (text) => text.how.quoteSteps[1] },
  { role: 'body', label: 'body', sample: (text) => text.what.items[1] ?? text.what.heading },
  { role: 'body-small', label: 'body-small', sample: (text) => text.what.figureCaption },
  { role: 'label', label: 'label', sample: (text) => text.apply },
  { role: 'label-compact', label: 'label-compact', sample: (text) => text.times.columns[0] },
  {
    role: 'numeric',
    label: 'numeric',
    sample: (text, formatNumber) =>
      text.times.rows.map(([, , grants]) => formatNumber(grants)).join(' · '),
  },
  { role: 'code', label: 'code', family: 'mono', sample: () => caseNumberSample },
]

const tokenPrefix = (role: string) => `--kv-font-${role}`

/**
 * The family as theme.css uses it: body falls back to sans and heading to serif when they
 * aren't set.
 */
const familyValue = (family: RoleFamily): string =>
  family === 'mono'
    ? 'var(--kv-font-family-mono)'
    : `var(--kv-font-family-${family}, var(--kv-font-family-${family === 'heading' ? 'serif' : 'sans'}))`

/** A role's own tokens as inline style, so the sample shows exactly that role. */
function roleStyle({ role, family = 'body' }: TypeRole): CSSProperties {
  const prefix = tokenPrefix(role)
  return {
    display: 'block',
    fontFamily: familyValue(family),
    fontSize: `var(${prefix}-size)`,
    fontWeight: `var(${prefix}-weight)`,
    lineHeight: `var(${prefix}-line-height)`,
    letterSpacing: `var(${prefix}-letter-spacing)`,
    fontFeatureSettings: `var(${prefix}-feature-settings)`,
  }
}

interface RoleValues {
  size: string | undefined
  sizePixels: number | undefined
  weight: string | undefined
  lineHeight: string | undefined
  letterSpacing: string | undefined
  features: string | undefined
}

/** The family custom properties, in the order the page lists them. */
interface FontFamilyToken {
  property: string
  use: string
  /** For the site-wide defaults theme.css doesn't set: what they fall back to. */
  fallback?: string
}

const fontFamilyTokens: readonly FontFamilyToken[] = [
  {
    property: '--kv-font-family-body',
    use: 'Body text, prose, buttons and navigation items. A site-wide default you set',
    fallback: '--kv-font-family-sans',
  },
  {
    property: '--kv-font-family-heading',
    use: 'Prose h1 to h6, and wherever you apply the display tokens. A site-wide default you set',
    fallback: '--kv-font-family-serif',
  },
  { property: '--kv-font-family-sans', use: 'IBM Plex Sans, then the system stack' },
  {
    property: '--kv-font-family-serif',
    use: 'IBM Plex Serif, then the system serif stack. Headings',
  },
  {
    property: '--kv-font-family-system',
    use: 'The system fallback stack. It covers å ä ö æ ø and the Northern Sámi letters',
  },
  {
    property: '--kv-font-family-system-serif',
    use: 'The system serif fallback stack, the twin of the system stack. End your own serif stack with it',
  },
  { property: '--kv-font-family-mono', use: 'Reference numbers and code' },
]

/** By role: its values on the page. */
type TypeRoleValues = Record<string, RoleValues>

/** By family custom property: its value on the page, or `undefined` when it isn't set. */
type FontFamilyValues = Record<string, string | undefined>

/** Module level, so it's stable for useLiveValue. Reads from the page, not from :root. */
function readTypeRoles(element: HTMLDivElement): TypeRoleValues {
  const roles: TypeRoleValues = {}
  for (const { role } of typeRoles) {
    const prefix = tokenPrefix(role)
    roles[role] = {
      size: readProperty(element, `${prefix}-size`),
      sizePixels: readLength(element, `${prefix}-size`),
      weight: readProperty(element, `${prefix}-weight`),
      lineHeight: readProperty(element, `${prefix}-line-height`),
      letterSpacing: readProperty(element, `${prefix}-letter-spacing`),
      features: readProperty(element, `${prefix}-feature-settings`),
    }
  }
  return roles
}

/** Module level, so it's stable for useLiveValue. Reads from the page, not from :root. */
const readFontFamilies = (element: HTMLDivElement): FontFamilyValues =>
  Object.fromEntries(
    fontFamilyTokens.map(({ property }) => [property, readProperty(element, property)]),
  )

const notDefined = 'Not defined'
const roundPixels = (pixels: number) => `${Number(pixels.toFixed(2))}px`

function formatSize({ size, sizePixels }: RoleValues): string {
  if (size === undefined || sizePixels === undefined) {
    return notDefined
  }
  return `${size} · ${roundPixels(sizePixels)}`
}

/** Unitless line heights, as the theme writes them, with the px they come to. */
function formatLineHeight({ lineHeight, sizePixels }: RoleValues): string {
  const factor = Number(lineHeight)
  if (lineHeight === undefined || sizePixels === undefined || Number.isNaN(factor)) {
    return lineHeight ?? notDefined
  }
  return `${lineHeight} · ${roundPixels(factor * sizePixels)}`
}

function formatLetterSpacing({ letterSpacing, sizePixels }: RoleValues): string {
  if (letterSpacing === undefined) {
    return notDefined
  }
  const ems = /^(-?[\d.]+)em$/.exec(letterSpacing)?.[1]
  if (ems === undefined || sizePixels === undefined) {
    return letterSpacing
  }
  if (Number(ems) === 0) {
    return 'None (0)'
  }
  return `${letterSpacing} · ${roundPixels(Number(ems) * sizePixels)}`
}

/** `'tnum', 'cv05', 'cv08'` as `tnum, cv05, cv08`. */
function formatFeatures(features: string | undefined): string {
  if (features === undefined) {
    return notDefined
  }
  return features === 'normal' ? 'None (normal)' : features.replaceAll(/["']/g, '')
}

function TypeRolesTable({
  locale,
  roles,
}: {
  locale: FixtureLocale
  roles: TypeRoleValues | undefined
}) {
  const { text, lang } = articleFor(locale)
  const sampleLang = lang ?? locale
  const number = new Intl.NumberFormat(sampleLang)
  return (
    <ScrollTable caption="Type role tokens">
      <thead>
        <tr>
          <th scope="col">Role</th>
          <th scope="col">Sample</th>
          <th scope="col">Size</th>
          <th scope="col">Weight</th>
          <th scope="col">Line height</th>
          <th scope="col">Letter spacing</th>
          <th scope="col">Features</th>
          <th scope="col">Token prefix</th>
        </tr>
      </thead>
      <tbody>
        {typeRoles.map((typeRole) => {
          const roleValues = roles?.[typeRole.role]
          return (
            <tr key={typeRole.role}>
              <th scope="row">{typeRole.label}</th>
              <td>
                <span lang={sampleLang} style={roleStyle(typeRole)}>
                  {typeRole.sample(text, (value) => number.format(value))}
                </span>
              </td>
              <td>{roleValues === undefined ? notDefined : formatSize(roleValues)}</td>
              <td>{roleValues?.weight ?? notDefined}</td>
              <td>{roleValues === undefined ? notDefined : formatLineHeight(roleValues)}</td>
              <td>{roleValues === undefined ? notDefined : formatLetterSpacing(roleValues)}</td>
              <td>{formatFeatures(roleValues?.features)}</td>
              <td>
                <code>{`${tokenPrefix(typeRole.role)}-*`}</code>
              </td>
            </tr>
          )
        })}
      </tbody>
    </ScrollTable>
  )
}

/** Each family, live: the value set on this page, or what an unset default falls back to. */
function FontFamilyTable({ families }: { families: FontFamilyValues | undefined }) {
  return (
    <ScrollTable caption="Font families">
      <thead>
        <tr>
          <th scope="col">Custom property</th>
          <th scope="col">Use</th>
          <th scope="col">Value here</th>
        </tr>
      </thead>
      <tbody>
        {fontFamilyTokens.map(({ property, use, fallback }) => {
          const value = families?.[property]
          return (
            <tr key={property}>
              <th scope="row">
                <code>{property}</code>
              </th>
              <td>{use}</td>
              <td>
                {value === undefined && fallback !== undefined ? (
                  <>
                    Not set, so <code>{fallback}</code>
                  </>
                ) : (
                  (value ?? notDefined)
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </ScrollTable>
  )
}

const glyphs = 'Å Ä Ö Æ Ø á č đ ŋ š ŧ ž'
const lookAlikes = 'Il1 0O'

type SpecimenFamily = 'body' | 'heading' | 'system' | 'system-serif' | 'mono'

const specimenFamilies: readonly SpecimenFamily[] = [
  'body',
  'heading',
  'system',
  'system-serif',
  'mono',
]

const specimenLabels: Record<SpecimenFamily, string> = {
  body: 'Body (Plex Sans)',
  heading: 'Heading (Plex Serif)',
  system: 'System fallback',
  'system-serif': 'System serif fallback',
  mono: 'Mono, the code role',
}

const specimenFontFamily = (family: SpecimenFamily): string =>
  family === 'system' || family === 'system-serif'
    ? `var(--kv-font-family-${family})`
    : familyValue(family)

const specimenStyle = (family: SpecimenFamily): CSSProperties => ({
  fontFamily: specimenFontFamily(family),
  fontSize: 'var(--kv-font-heading-1-size)',
  lineHeight: 'var(--kv-font-heading-1-line-height)',
  fontFeatureSettings: family === 'mono' ? 'normal' : 'var(--kv-font-body-feature-settings)',
})

function GlyphSpecimen() {
  return (
    <ScrollTable caption="Glyph specimen">
      <thead>
        <tr>
          <th scope="col">Family</th>
          <th scope="col">Nordic and Sámi letters</th>
          <th scope="col">Look-alikes</th>
        </tr>
      </thead>
      <tbody>
        {specimenFamilies.map((family) => (
          <tr key={family}>
            <th scope="row">{specimenLabels[family]}</th>
            <td>
              <span style={specimenStyle(family)}>{glyphs}</span>
            </td>
            <td>
              <span style={specimenStyle(family)}>{lookAlikes}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  )
}

const amounts = [1111.11, 8888.88, 10_450, 47.5, 123_456.7]
const amountFormat = new Intl.NumberFormat('en', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const figureStyle = (role: 'body' | 'numeric'): CSSProperties => ({
  textAlign: 'end',
  fontFeatureSettings: `var(--kv-font-${role}-feature-settings)`,
})

function TabularFiguresTable() {
  return (
    <ScrollTable caption="Tabular figures">
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: 'end' }}>
            body: the font’s default figures
          </th>
          <th scope="col" style={{ textAlign: 'end' }}>
            numeric: tabular figures
          </th>
        </tr>
      </thead>
      <tbody>
        {amounts.map((amount) => (
          <tr key={amount}>
            <td style={figureStyle('body')}>{amountFormat.format(amount)}</td>
            <td style={figureStyle('numeric')}>{amountFormat.format(amount)}</td>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  )
}

function TypeRolesPage({ locale }: { locale: FixtureLocale }): ReactNode {
  const [ref, roles] = useLiveValue(readTypeRoles)
  const { lang } = articleFor(locale)
  return (
    <FoundationPage title="Type roles">
      <div ref={ref}>
        <p>
          Every type role in <code>theme.css</code>, with its values read live from this page. Each
          sample is set in the role’s own tokens, so an override shows up here. Sizes are in rem, so
          they follow the browser’s text size (1.4.4), and the px values are at the current root
          size.
        </p>
        <p>
          The samples are in the toolbar locale.{' '}
          {lang === undefined
            ? null
            : 'This locale has no translated fixture yet, so they are in English.'}{' '}
          <code>lead</code> is only for the lead paragraph of large prose (ADR-0018).
        </p>
        <TypeRolesTable locale={locale} roles={roles} />
      </div>
    </FoundationPage>
  )
}

function FontFamiliesPage(): ReactNode {
  const [ref, families] = useLiveValue(readFontFamilies)
  return (
    <FoundationPage title="Font families">
      <div ref={ref}>
        <p>
          Body text and controls use <code>--kv-font-family-body</code>, and prose headings (h1 to
          h6) <code>--kv-font-family-heading</code>. Use it wherever you apply the display tokens
          too. theme.css doesn’t set either. Body falls back to <code>--kv-font-family-sans</code>:
          IBM Plex Sans, then the system stack. Headings fall back to{' '}
          <code>--kv-font-family-serif</code>: IBM Plex Serif, then the system serif stack. Set them
          once, on <code>:root</code> or on a container, for a brand font. To keep sans headings,
          set <code>--kv-font-family-heading</code> to <code>var(--kv-font-family-sans)</code>. The
          Type roles samples follow them.
        </p>
        <FontFamilyTable families={families} />
      </div>
    </FoundationPage>
  )
}

function GlyphsPage(): ReactNode {
  return (
    <FoundationPage title="Glyphs">
      <p>
        A replacement brand font must cover these letters, and so do the system fallbacks. IBM Plex
        tells l, I and 1, and O and 0, apart without features. A replacement font that can’t needs
        its own feature settings (Inter: <code>cv05</code>, <code>cv08</code>) in the body role
        tokens. The system fonts can’t: Segoe UI, Roboto and San Francisco draw I and l almost
        alike, and no feature setting fixes that.
      </p>
      <GlyphSpecimen />
    </FoundationPage>
  )
}

function TabularFiguresPage(): ReactNode {
  return (
    <FoundationPage title="Tabular figures">
      <p>
        Use <code>numeric</code> for tables, amounts, dates and reference numbers. Its figures all
        have the same width, so a column of amounts lines up. Prose tables set it on every{' '}
        <code>td</code>. Plex has only tabular figures, so both columns line up here. In most system
        fonts body figures are proportional.
      </p>
      <TabularFiguresTable />
    </FoundationPage>
  )
}

const meta = {
  title: 'Foundation/Typography',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every type role, its sample in the toolbar locale and its values measured live. */
export const TypeRoles: Story = {
  name: 'Type roles',
  render: (_args, { globals }) => <TypeRolesPage locale={fixtureLocaleOf(globals['locale'])} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole('table', { name: 'Type role tokens' })
    const { text } = articleFor(fixtureLocaleOf(globals['locale']))
    // One row per role, each with a row header.
    await expect(within(table).getAllByRole('row')).toHaveLength(typeRoles.length + 1)
    for (const typeRole of typeRoles) {
      await expect(within(table).getByRole('rowheader', { name: typeRole.label })).toBeVisible()
    }
    await expect(within(table).getAllByText(text.title)).toHaveLength(2)
  },
}

/** Each family custom property, live: the value here, or what an unset default falls back to. */
export const FontFamilies: Story = {
  name: 'Font families',
  render: () => <FontFamiliesPage />,
  play: async ({ canvas }) => {
    // Every family custom property has a row, the two site-wide defaults included.
    const families = canvas.getByRole('table', { name: 'Font families' })
    for (const { property } of fontFamilyTokens) {
      await expect(within(families).getByRole('rowheader', { name: property })).toBeVisible()
    }
  },
}

/** The Nordic and Sámi letters and the look-alikes, in every family. */
export const Glyphs: Story = {
  render: () => <GlyphsPage />,
  play: async ({ canvas }) => {
    const specimen = canvas.getByRole('table', { name: 'Glyph specimen' })
    for (const family of specimenFamilies) {
      await expect(
        within(specimen).getByRole('rowheader', { name: specimenLabels[family] }),
      ).toBeVisible()
    }
  },
}

/** A column of amounts in body's default figures, next to numeric's tabular ones. */
export const TabularFigures: Story = {
  name: 'Tabular figures',
  render: () => <TabularFiguresPage />,
  play: async ({ canvas }) => {
    const figures = canvas.getByRole('table', { name: 'Tabular figures' })
    await expect(figures).toBeVisible()
    await expect(within(figures).getAllByRole('row')).toHaveLength(amounts.length + 1)
  },
}
