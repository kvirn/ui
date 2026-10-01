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

// Foundation/Typography/Type scale (docs/design/foundations-and-prose.md §6.6): every type
// role, rendered in its own tokens and with its values read live from the page. The samples
// are fixture text in the toolbar locale; the page around them is English maintainer text.

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

/** The family as theme.css uses it: body and heading fall back to sans when they aren't set. */
const familyValue = (family: RoleFamily): string =>
  family === 'mono'
    ? 'var(--kv-font-family-mono)'
    : `var(--kv-font-family-${family}, var(--kv-font-family-sans))`

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
    use: 'Prose headings. A site-wide default you set',
    fallback: '--kv-font-family-sans',
  },
  { property: '--kv-font-family-sans', use: 'Inter, then the system stack' },
  {
    property: '--kv-font-family-system',
    use: 'The system fallback stack. It covers å ä ö æ ø and the Northern Sámi letters',
  },
  { property: '--kv-font-family-mono', use: 'Reference numbers and code' },
]

interface TypeScaleValues {
  roles: Record<string, RoleValues>
  families: Record<string, string | undefined>
}

/** Module level, so it's stable for useLiveValue. Reads from the page, not from :root. */
function readTypeScale(element: HTMLDivElement): TypeScaleValues {
  const roles: Record<string, RoleValues> = {}
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
  const families = Object.fromEntries(
    fontFamilyTokens.map(({ property }) => [property, readProperty(element, property)]),
  )
  return { roles, families }
}

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

function TypeScaleTable({
  locale,
  values,
}: {
  locale: FixtureLocale
  values: TypeScaleValues | undefined
}) {
  const { text, lang } = articleFor(locale)
  const sampleLang = lang ?? locale
  const number = new Intl.NumberFormat(sampleLang)
  const roles = values?.roles
  return (
    <ScrollTable caption="Type roles">
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
function FontFamilyTable({ values }: { values: TypeScaleValues | undefined }) {
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
          const value = values?.families[property]
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

type SpecimenFamily = 'body' | 'heading' | 'system' | 'mono'

const specimenFamilies: readonly SpecimenFamily[] = ['body', 'heading', 'system', 'mono']

const specimenLabels: Record<SpecimenFamily, string> = {
  body: 'Body, with the body features',
  heading: 'Heading',
  system: 'System fallback, with the body features',
  mono: 'Mono, the code role',
}

const specimenStyle = (family: SpecimenFamily): CSSProperties => ({
  fontFamily: family === 'system' ? 'var(--kv-font-family-system)' : familyValue(family),
  fontSize: 'var(--kv-font-heading-1-size)',
  lineHeight: 'var(--kv-font-heading-1-line-height)',
  fontFeatureSettings:
    family === 'body' || family === 'system' ? 'var(--kv-font-body-feature-settings)' : 'normal',
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

function TabularFigures() {
  return (
    <ScrollTable caption="Tabular figures">
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: 'end' }}>
            body: proportional figures
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

function TypeScalePage({ locale }: { locale: FixtureLocale }): ReactNode {
  const [ref, values] = useLiveValue(readTypeScale)
  const { lang } = articleFor(locale)
  return (
    <FoundationPage title="Type scale">
      <div ref={ref}>
        <>
          <p>
            Every type role in <code>theme.css</code>, with its values read live from this page.
            Each sample is set in the role’s own tokens, so an override shows up here. Sizes are in
            rem, so they follow the browser’s text size (1.4.4), and the px values are at the
            current root size.
          </p>
          <p>
            The samples are in the toolbar locale.{' '}
            {lang === undefined
              ? null
              : 'This locale has no translated fixture yet, so they are in English.'}{' '}
            <code>lead</code> is only for the lead paragraph of large prose (ADR-0018).
          </p>
          <TypeScaleTable locale={locale} values={values} />

          <h2>Font families</h2>
          <p>
            Body text and controls use <code>--kv-font-family-body</code>, and prose headings{' '}
            <code>--kv-font-family-heading</code>. theme.css doesn’t set either, so both fall back
            to <code>--kv-font-family-sans</code>: Inter, then the system stack. Set them once, on{' '}
            <code>:root</code> or on a container, for a brand font. The samples above follow them.
          </p>
          <FontFamilyTable values={values} />

          <h2>Glyphs</h2>
          <p>
            A replacement brand font must cover these letters, and so does the system fallback. The
            body roles ask for Inter’s <code>cv05</code> and <code>cv08</code>, so that l, I and 1
            look different. A replacement font without those features can’t tell the look-alikes
            apart.
          </p>
          <GlyphSpecimen />

          <h2>Tabular figures</h2>
          <p>
            Use <code>numeric</code> for tables, amounts, dates and reference numbers. Its figures
            all have the same width, so a column of amounts lines up. Prose tables set it on every{' '}
            <code>td</code>.
          </p>
          <TabularFigures />
        </>
      </div>
    </FoundationPage>
  )
}

const meta = {
  title: 'Foundation/Typography/Type scale',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TypeScale: Story = {
  name: 'Type scale',
  render: (_args, { globals }) => <TypeScalePage locale={fixtureLocaleOf(globals['locale'])} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole('table', { name: 'Type roles' })
    const { text } = articleFor(fixtureLocaleOf(globals['locale']))
    // One row per role, each with a row header.
    await expect(within(table).getAllByRole('row')).toHaveLength(typeRoles.length + 1)
    for (const typeRole of typeRoles) {
      await expect(within(table).getByRole('rowheader', { name: typeRole.label })).toBeVisible()
    }
    await expect(within(table).getAllByText(text.title)).toHaveLength(2)
    await expect(canvas.getByRole('table', { name: 'Tabular figures' })).toBeVisible()
    // Every family custom property has a row, the two site-wide defaults included.
    const families = canvas.getByRole('table', { name: 'Font families' })
    for (const { property } of fontFamilyTokens) {
      await expect(within(families).getByRole('rowheader', { name: property })).toBeVisible()
    }
  },
}
