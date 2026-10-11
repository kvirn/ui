import { readRootProperties, themeEnvironment, themeNames } from '@kvirn-ui/theme'
import type { ThemeName } from '@kvirn-ui/theme'
import themeCss from '@kvirn-ui/theme/theme.css?raw'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { ColorsPage, ratioText } from './colors-helpers.tsx'
import {
  currentThemeName,
  forcedColorsEnvironment,
  isForcedColors,
  readColor,
  readPaletteSteps,
  ratioOf,
  useLiveValue,
  VerdictBadge,
} from './foundation-helpers.tsx'

// The Palette story of Foundation/Colors (colors.stories.tsx, docs/design/foundations-and-prose.md
// §6.6): the raw scales, the first tier of colour. They're named by role, not hue, so a rebrand
// overrides one scale. Every hex is read live from the page, so an override on :root shows up.
// The white and black ratios help a rebrand pick a step for text or a fill.

interface Scale {
  name: string
  heading: string
  /** The hue the default theme gives the role. */
  defaultHue: string
  description: string
}

const scales: readonly Scale[] = [
  {
    name: 'neutral',
    heading: 'Neutral',
    defaultHue: 'grey with a faint cool tint',
    description: 'Canvases, surfaces, borders and text.',
  },
  {
    name: 'primary',
    heading: 'Primary',
    defaultHue: 'blue',
    description:
      'Primary buttons, links, focus rings, selection and the current page. The default blue is 500.',
  },
  {
    name: 'secondary',
    heading: 'Secondary',
    defaultHue: 'the neutral steps',
    description:
      'The secondary button’s edge. Each step is a var() of the same neutral step, so it looks like border-control until you give it a hue.',
  },
  {
    name: 'accent',
    heading: 'Accent',
    defaultHue: 'teal',
    description:
      'Not used by the default theme: there for your brand’s second colour. It isn’t a drop-in primary: white text on its 500 is below 4.5:1.',
  },
  {
    name: 'danger',
    heading: 'Danger',
    defaultHue: 'red',
    description: 'Errors and destructive actions.',
  },
  { name: 'success', heading: 'Success', defaultHue: 'green', description: 'Confirmation.' },
  {
    name: 'warning',
    heading: 'Warning',
    defaultHue: 'amber',
    description: 'Warnings and deadlines.',
  },
]

/** The palette as theme.css declares it. The steps of each scale come from the file. */
const declaredPalette = readRootProperties(themeCss, themeEnvironment('light'))

const stepsOf = (scale: string): string[] =>
  Object.keys(declaredPalette).flatMap((property) => {
    const match = new RegExp(`^--kv-${scale}-(\\d+)$`).exec(property)
    return match?.[1] === undefined ? [] : [match[1]]
  })

const scaleSteps = new Map(scales.map((scale) => [scale.name, stepsOf(scale.name)]))

const plainTokens = ['white', 'black'] as const

interface Alias {
  label: string
  token: string
}

/** The colours used most, shown first. Primary and secondary point at a step per theme. */
const aliases: readonly Alias[] = [
  { label: 'Primary', token: '--kv-color-primary' },
  { label: 'Secondary', token: '--kv-color-secondary' },
  { label: 'White', token: '--kv-white' },
  { label: 'Black', token: '--kv-black' },
]

type CurrentTheme = ThemeName | 'forced-colors'

/** By theme, then by `--kv-*` property: the palette step it points at, such as `primary-500`. */
const stepsByTheme = new Map<CurrentTheme, Record<string, string>>([
  ...themeNames.map((theme) => [theme, readPaletteSteps(themeEnvironment(theme))] as const),
  ['forced-colors', readPaletteSteps(forcedColorsEnvironment)],
])

/** What an alias is in a theme: the step it points at, or the raw value white and black are. */
function aliasNote(token: string, theme: CurrentTheme): string {
  if (token === '--kv-white' || token === '--kv-black') {
    return 'Raw value, the same in every theme'
  }
  return `Points at ${stepsByTheme.get(theme)?.[token] ?? 'an unknown step'} in this theme`
}

interface PaletteSnapshot {
  theme: CurrentTheme
  /** By token, such as `--kv-neutral-500`: the live hex, or `undefined` if it can't be measured. */
  colors: Record<string, string | undefined>
}

function readPalette(element: HTMLElement): PaletteSnapshot {
  const tokens = [
    ...aliases.map((alias) => alias.token),
    ...plainTokens.map((name) => `--kv-${name}`),
    ...scales.flatMap((scale) =>
      (scaleSteps.get(scale.name) ?? []).map((step) => `--kv-${scale.name}-${step}`),
    ),
  ]
  return {
    theme: isForcedColors(element) ? 'forced-colors' : currentThemeName(element),
    colors: Object.fromEntries(tokens.map((token) => [token, readColor(element, token)])),
  }
}

/** WCAG AA for normal text (1.4.3). Steps between 3:1 and this work for large text and edges. */
const textMinimum = 4.5

/**
 * "Aa" in white or black on the card's colour, drawn only from 4.5:1, like Text on surface.
 * Below that it's a stripe in the text colour, so the page never shows unreadable text.
 */
function SampleText({ ratio, color }: { ratio: number | undefined; color: string }): ReactNode {
  if (ratio === undefined) {
    return null
  }
  const passes = ratio >= textMinimum
  return (
    <span className="kv-story-card-sample" style={{ color: `var(${color})` }}>
      {passes ? 'Aa' : <span className="kv-story-chip-stripe" />}
    </span>
  )
}

/** One row of the card: which text, its verdict and its ratio. */
function VerdictRow({ label, ratio }: { label: string; ratio: number | undefined }): ReactNode {
  return (
    <div className="kv-story-card-row">
      <dt>{label}</dt>
      <dd>
        {ratio === undefined ? null : <VerdictBadge passes={ratio >= textMinimum} />}
        {ratioText(ratio)}
      </dd>
    </div>
  )
}

/**
 * A colour card: the step as a swatch with white and black samples on it, then the step,
 * hex, token and the two verdicts as text. The swatch is decorative: the text has it all.
 */
function ColorCard({
  label,
  token,
  note,
  colors,
}: {
  label: string
  token: string
  /** For an alias: what it points at, such as "Points at primary-500 in this theme". */
  note?: string | undefined
  colors: PaletteSnapshot['colors']
}): ReactNode {
  const hex = colors[token]
  const white = ratioOf(colors['--kv-white'], hex)
  const black = ratioOf(colors['--kv-black'], hex)
  return (
    <li className="kv-story-card">
      <div
        aria-hidden="true"
        className="kv-story-card-color"
        style={{ backgroundColor: `var(${token})` }}
      >
        <SampleText ratio={white} color="--kv-white" />
        <SampleText ratio={black} color="--kv-black" />
      </div>
      <div className="kv-story-card-body">
        <p className="kv-story-card-title">
          <span>{label}</span>
          <span className="kv-story-card-hex">{hex ?? ratioText(undefined)}</span>
        </p>
        <code>{token}</code>
        {note === undefined ? null : <p className="kv-story-card-note">{note}</p>}
        <dl>
          <VerdictRow label="White" ratio={white} />
          <VerdictRow label="Black" ratio={black} />
        </dl>
      </div>
    </li>
  )
}

/**
 * The cards of one scale, as a labelled list. kv-not-prose keeps prose's list styles off.
 */
function ColorCards({
  label,
  cards,
  colors,
}: {
  label: string
  cards: readonly { label: string; token: string; note?: string }[]
  colors: PaletteSnapshot['colors']
}): ReactNode {
  return (
    <ul aria-label={label} className="kv-story-cards kv-not-prose">
      {cards.map((card) => (
        <ColorCard
          key={card.token}
          label={card.label}
          token={card.token}
          note={card.note}
          colors={colors}
        />
      ))}
    </ul>
  )
}

export function PalettePage(): ReactNode {
  const [pageRef, snapshot] = useLiveValue<PaletteSnapshot, HTMLElement>(readPalette)
  return (
    <ColorsPage title="Palette" pageRef={pageRef}>
      {snapshot === undefined ? null : (
        <>
          <p>
            The first tier of colour: Tailwind-style scales from 50 (lightest) to 950 (darkest),
            plus white and black. They are the only raw colour values in <code>theme.css</code>.
            Components never use them directly: the semantic tokens point at them.
          </p>
          <p>
            Each scale is named for its role, not its hue, so a rebrand never needs a refactor.
            Override the 11 steps of one scale on <code>:root</code>, such as{' '}
            <code>--kv-primary-*</code> with your brand’s colours, and all four themes follow. A
            swapped scale can break contrast, so check the result on Colors: Text on surface or with{' '}
            <code>checkThemeCss()</code>.
          </p>
          <p>
            Every hex is read live from this page. White text means <code>--kv-white</code> and
            black text means <code>--kv-black</code>, so the ratios show which steps can carry text
            or a filled button in a rebrand. Each card shows the step with white and black “Aa” on
            it. “Pass” means the pair reaches 4.5:1, WCAG AA for normal text (1.4.3). “Fail” means
            it doesn’t, and the card shows a stripe instead of the text, but a step from 3:1 still
            works for large text, control edges and focus rings. The contrast themes need 7:1 for
            text.
          </p>
          <h2>Aliases</h2>
          <p>
            The colours you’ll use most. <code>--kv-color-primary</code> and{' '}
            <code>--kv-color-secondary</code> are semantic tokens: each points at a step, and the
            step can change with the theme, so use them rather than a step and every theme and
            rebrand reaches your CSS. <code>--kv-white</code> and <code>--kv-black</code> are raw
            values, and <code>--kv-black</code> is a near-black, not pure black. All semantic tokens
            are on Colors: Semantic tokens.
          </p>
          <ColorCards
            label="Aliases"
            cards={aliases.map((alias) => ({
              ...alias,
              note: aliasNote(alias.token, snapshot.theme),
            }))}
            colors={snapshot.colors}
          />
          {scales.map((scale) => (
            <ScaleSection key={scale.name} scale={scale} colors={snapshot.colors} />
          ))}
        </>
      )}
    </ColorsPage>
  )
}

function ScaleSection({
  scale,
  colors,
}: {
  scale: Scale
  colors: PaletteSnapshot['colors']
}): ReactNode {
  const steps = scaleSteps.get(scale.name) ?? []
  return (
    <>
      <h2>{scale.heading}</h2>
      <p>
        {scale.heading}: {scale.defaultHue} by default. {scale.description}
      </p>
      {/* The steps side by side, lightest first. Decorative: the cards have every value. */}
      <div className="kv-story-strip" aria-hidden="true">
        {steps.map((step) => (
          <span key={step} style={{ backgroundColor: `var(--kv-${scale.name}-${step})` }} />
        ))}
      </div>
      <ColorCards
        label={`${scale.heading} scale, --kv-${scale.name}-*`}
        cards={steps.map((step) => ({ label: step, token: `--kv-${scale.name}-${step}` }))}
        colors={colors}
      />
    </>
  )
}

/** Every scale has a heading and a named list of cards, and verdicts are in words (1.4.1). */
export async function expectPalette(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await waitFor(() =>
    expect(canvas.getByRole('heading', { level: 2, name: 'Neutral' })).toBeVisible(),
  )
  for (const scale of scales) {
    await expect(canvas.getByRole('heading', { level: 2, name: scale.heading })).toBeVisible()
    const cards = canvas.getByRole('list', {
      name: `${scale.heading} scale, --kv-${scale.name}-*`,
    })
    await expect(within(cards).getAllByRole('listitem').length).toBeGreaterThan(0)
  }
  const aliasCards = canvas.getByRole('list', { name: 'Aliases' })
  await expect(within(aliasCards).getAllByRole('listitem')).toHaveLength(aliases.length)
  // Each verdict says Pass or Fail in words, never by colour alone (1.4.1).
  const verdicts = [...canvasElement.querySelectorAll('.kv-story-badge')]
  await expect(verdicts.length).toBeGreaterThan(0)
  await expect(verdicts.every((verdict) => /^(?:Pass|Fail)$/.test(verdict.textContent))).toBe(true)
}
