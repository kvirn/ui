import { Button, Link } from '@kvirn-ui/react'
import {
  colorTokenNames,
  contrastRequirements,
  themeEnvironment,
  themeNames,
} from '@kvirn-ui/theme'
import type { ColorTokenName, ContrastMinimum, ThemeName } from '@kvirn-ui/theme'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import {
  currentThemeName,
  formatRatio,
  isForcedColors,
  ratioOf,
  readColor,
  readPaletteSteps,
  themeLabels,
  useLiveValue,
  VerdictBadge,
} from './foundation-helpers.tsx'
import { fixedThemeStory, ForcedColorsNotice, formatMinimum, TokenPage } from './tokens-helpers.tsx'

// Foundation/Theming (docs/design/foundations-and-prose.md §6.6): the three levels of
// theming, with a live rebrand next to the default and a contrast check of every pair in use,
// measured on the rebranded wrapper in the current theme. The rebrand overrides one role
// scale, --kv-primary-*, with a teal brand scale that passes in all four themes (ADR-0019).

const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

/** A municipality's teal, as the primary scale. theme-css.test.ts checks it in every theme. */
const brandScale: Readonly<Record<string, string>> = {
  '50': '#edfafa',
  '100': '#cdf0f0',
  '200': '#9be0e2',
  '300': '#5fc6cb',
  '400': '#26a4ac',
  '500': '#007d86',
  '600': '#00707a',
  '700': '#005a62',
  '800': '#00474e',
  '900': '#003a40',
  '950': '#00262a',
}

const brandScaleDeclarations = steps.map((step) => `--kv-primary-${step}: ${brandScale[step]};`)

/** The rebrand as an app writes it. */
const rebrandCss = `/* Your brand's colours as the primary scale. All four themes follow. */
:root {
${brandScaleDeclarations.map((declaration) => `  ${declaration}`).join('\n')}
}`

/** The palette step each semantic token points at, per theme, read from theme.css. */
const themeSteps = Object.fromEntries(
  themeNames.map((theme) => [theme, readPaletteSteps(themeEnvironment(theme))]),
) as Record<ThemeName, Record<string, string>>

/** The tokens that use the primary scale in some theme: the ones the rebrand changes. */
const rebrandedTokens: ReadonlySet<ColorTokenName> = new Set(
  colorTokenNames.filter((token) =>
    themeNames.some((theme) => themeSteps[theme][`--kv-color-${token}`]?.startsWith('primary-')),
  ),
)

const brandSelectors: Record<ThemeName, string> = {
  light: '.municipal-brand',
  dark: ":root[data-kv-color-scheme='dark'] .municipal-brand",
  'light-contrast': ":root[data-kv-color-scheme='light'][data-kv-contrast='more'] .municipal-brand",
  'dark-contrast': ":root[data-kv-color-scheme='dark'][data-kv-contrast='more'] .municipal-brand",
}

/**
 * The same rebrand, scoped to one panel. A custom property is resolved where it's declared,
 * and the semantic tokens are declared on :root, so on a wrapper they're re-pointed at the
 * same steps theme.css uses in each theme. On :root the scale alone is enough.
 */
const scopedRebrandCss = themeNames
  .map((theme) => {
    const tokens = [...rebrandedTokens].map(
      (token) => `--kv-color-${token}: var(--kv-${themeSteps[theme][`--kv-color-${token}`]});`,
    )
    const declarations = theme === 'light' ? [...brandScaleDeclarations, ...tokens] : tokens
    return `${brandSelectors[theme]} { ${declarations.join(' ')} }`
  })
  .join('\n')

/** The site-wide defaults, as an app writes them once. */
const siteDefaultsCss = `/* Set once. Nothing needs a class. */
:root {
  --kv-font-family-body: 'Source Sans 3', var(--kv-font-family-system);
  --kv-font-family-heading: 'Merriweather', Georgia, serif;
  --kv-card-radius-default: var(--kv-radius-md);
  /* Never below 24px (2.5.8). Resident-facing buttons should stay 44px. */
  --kv-button-min-block-size: 2.5rem;
  --kv-button-font-weight: 600;
}

/* Resolved on each card, so the compact step-down still applies. */
.kv-card {
  --kv-card-padding-default: var(--kv-card-padding-lg);
}`

const siteDefaultsMarkup = `<!-- Compact controls on the whole staff tool, from 64rem. -->
<html class="kv-compact">`

const unlayeredCss = `.my-button {
  border-radius: 0;
}`

const readColors = (element: Element) =>
  Object.fromEntries(
    colorTokenNames.map((token) => [token, readColor(element, `--kv-color-${token}`)]),
  ) as Record<ColorTokenName, string | undefined>

/** One side of a pair: its two colours and their ratio. */
interface PairSide {
  foregroundColor: string | undefined
  backgroundColor: string | undefined
  ratio: number | undefined
}

interface Pair {
  foreground: string
  background: string
  minimum: ContrastMinimum
  defaultSide: PairSide
  brandSide: PairSide
  isChanged: boolean
}

function readTheming(page: HTMLElement) {
  const brand = page.querySelector('.municipal-brand')
  const base = page.querySelector('[data-story-brand="default"]')
  const unlayered = page.querySelector('.my-button')
  if (brand === null || base === null || unlayered === null) {
    return null
  }
  const theme = currentThemeName(page)
  const brandColors = readColors(brand)
  const baseColors = readColors(base)
  const side = (
    colors: Record<string, string | undefined>,
    foreground: string,
    background: string,
  ): PairSide => ({
    foregroundColor: colors[foreground],
    backgroundColor: colors[background],
    ratio: ratioOf(colors[foreground], colors[background]),
  })
  const pairs = contrastRequirements[theme].map(({ foreground, background, minimum }): Pair => ({
    foreground,
    background,
    minimum,
    defaultSide: side(baseColors, foreground, background),
    brandSide: side(brandColors, foreground, background),
    isChanged:
      rebrandedTokens.has(foreground as ColorTokenName) ||
      rebrandedTokens.has(background as ColorTokenName),
  }))
  return {
    theme,
    isForcedColors: isForcedColors(page),
    pairs,
    failing: pairs.filter(
      ({ brandSide, minimum }) => brandSide.ratio === undefined || brandSide.ratio < minimum,
    ),
    unlayeredRadius: getComputedStyle(unlayered).borderTopLeftRadius,
  }
}

const ratioText = (ratio: number | undefined) =>
  ratio === undefined ? 'Can’t measure' : formatRatio(ratio)

/**
 * The pair drawn in its own colours. Text pairs show "Aa", but only when the pair reaches its
 * minimum: below it, a stripe, so the page never shows unreadable text. Non-text pairs (edges,
 * focus rings, indicators) show a 2px outline in the foreground colour.
 */
function PairSample({ side, minimum }: { side: PairSide; minimum: ContrastMinimum }): ReactNode {
  const isText = minimum !== 3
  const isReadable = side.ratio !== undefined && side.ratio >= minimum
  return (
    <span
      className="kv-story-pair-sample"
      style={{ backgroundColor: side.backgroundColor, color: side.foregroundColor }}
    >
      {isText ? (
        isReadable ? (
          'Aa'
        ) : (
          <span className="kv-story-chip-stripe" />
        )
      ) : (
        <span className="kv-story-pair-edge" />
      )}
    </span>
  )
}

/** A pair as a card: default and rebrand side by side, then the names, ratios and result. */
function PairCard({ pair }: { pair: Pair }): ReactNode {
  const { foreground, background, minimum, defaultSide, brandSide } = pair
  return (
    <li className="kv-story-card">
      <div aria-hidden="true" className="kv-story-pair-samples">
        <PairSample side={defaultSide} minimum={minimum} />
        <PairSample side={brandSide} minimum={minimum} />
      </div>
      <div className="kv-story-card-body">
        <p className="kv-story-card-title">
          <span>
            <code>{foreground}</code> on <code>{background}</code>
          </span>
        </p>
        <p className="kv-story-card-note">
          {minimum === 3 ? 'Non-text' : 'Text'}, needs {formatMinimum(minimum)}
        </p>
        <dl>
          <div className="kv-story-card-row">
            <dt>Default</dt>
            <dd>{ratioText(defaultSide.ratio)}</dd>
          </div>
          <div className="kv-story-card-row">
            <dt>Teal</dt>
            <dd>
              {brandSide.ratio === undefined ? null : (
                <VerdictBadge passes={brandSide.ratio >= minimum} />
              )}
              {ratioText(brandSide.ratio)}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  )
}

/** The same components, on the default tokens or on the rebrand. */
function BrandPanel({ isRebrand }: { isRebrand: boolean }): ReactNode {
  const headingId = useId()
  const title = isRebrand ? 'Teal rebrand' : 'Default'
  return (
    <section
      aria-labelledby={headingId}
      className={isRebrand ? 'kv-story-panel municipal-brand' : 'kv-story-panel'}
      data-story-brand={isRebrand ? 'rebrand' : 'default'}
    >
      <h3 id={headingId}>{title}</h3>
      <div className="kv-button-group">
        <Button className="kv-button--primary">Send application</Button>
        <Button data-focus-visible="">Save draft (shown focused)</Button>
      </div>
      <p>
        You can <Link href={`#${headingId}`}>read the guidance</Link> first.
      </p>
      <nav aria-label={`${title} example`}>
        <ul className="kv-nav">
          <li>
            <Link href={`#${headingId}`} current="page">
              Applications
            </Link>
          </li>
          <li>
            <Link href={`#${headingId}`}>Decisions</Link>
          </li>
        </ul>
      </nav>
    </section>
  )
}

function ThemingPage(): ReactNode {
  const [pageRef, values] = useLiveValue<ReturnType<typeof readTheming>, HTMLElement>(readTheming)
  return (
    <TokenPage title="Theming" pageRef={pageRef}>
      <style>{scopedRebrandCss}</style>
      <p>
        There are three levels. Each one keeps the components’ accessibility: they ship no CSS, and
        theme.css only styles the attributes they render.
      </p>

      <h2>1. Import theme.css</h2>
      <p>
        Import it once, and every KvirnUI component on the page gets the default look, in all four
        themes. Remove the import, and the components are unstyled again.
      </p>
      <pre>
        <code>import &apos;@kvirn-ui/theme/theme.css&apos;</code>
      </pre>

      <h2>2. Override the variables</h2>
      <p>
        The palette is role scales, named for what they do and not for their hue: neutral, primary,
        secondary, accent, danger, success and warning. To rebrand, give one scale your brand’s 11
        steps on <code>:root</code>, here <code>--kv-primary-*</code>, and all four themes follow.
        Nothing else changes.
      </p>
      <pre>
        <code>{rebrandCss}</code>
      </pre>
      <p>
        Each theme uses different steps of the scale: 500 for the primary button in light and dark,
        400 for links in dark, 800 in light high contrast and 200 in dark high contrast. Your scale
        has to work in every one of those roles. This teal brand scale passes in all four themes.
        The accent scale in theme.css (teal by default, unused by the default theme) isn’t a
        drop-in: white text on its 500 is 4.37:1, below 4.5:1, so this brand scale has a darker 500.
      </p>
      <p>
        Swapping a scale can break contrast, so check it. Run <code>checkThemeCss()</code> from{' '}
        <code>@kvirn-ui/theme</code> on your customised copy, or read the check below and the Text
        on surface page, which measure live. You can also point one semantic token at another step,
        such as <code>--kv-color-link: var(--kv-primary-700)</code>, or give{' '}
        <code>--kv-secondary-*</code> a hue for the secondary button’s edge.
      </p>
      <p>
        On this page the rebrand is scoped to one panel, so the panel also re-points the semantic
        tokens that use the primary scale. A custom property is resolved where it’s declared, and
        the semantic tokens are declared on <code>:root</code>. In your app, the scale on{' '}
        <code>:root</code> is all you need.
      </p>
      <div className="kv-story-columns">
        <BrandPanel isRebrand={false} />
        <BrandPanel isRebrand />
      </div>
      {values ? (
        <>
          <h3>Contrast check of the rebrand</h3>
          {values.isForcedColors ? <ForcedColorsNotice /> : null}
          <p>
            {themeLabels[values.theme]}: {values.pairs.length} pairs in use.{' '}
            {values.pairs.length - values.failing.length} pass, {values.failing.length} fail.
          </p>
          {values.failing.length > 0 ? (
            <ul aria-label="Failing pairs">
              {values.failing.map(({ foreground, background, brandSide, minimum }) => (
                <li key={`${foreground} on ${background}`}>
                  <code>{foreground}</code> on <code>{background}</code>:{' '}
                  {ratioText(brandSide.ratio)}, needs {formatMinimum(minimum)}
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            Each card draws the pair on the default tokens (left) and on the teal rebrand (right).
            Text pairs show “Aa”, and non-text pairs, such as edges and focus rings, show an
            outline.
          </p>
          <ul
            aria-label={`Pairs in use that the rebrand changes, ${themeLabels[values.theme]}`}
            className="kv-story-cards kv-not-prose"
          >
            {values.pairs
              .filter(({ isChanged }) => isChanged)
              .map((pair) => (
                <PairCard key={`${pair.foreground} on ${pair.background}`} pair={pair} />
              ))}
          </ul>
          <p>
            The same check runs on every theme in <code>vp run theme:check</code>, or with{' '}
            <code>checkThemeCss()</code> from <code>@kvirn-ui/theme</code> on your own file.
          </p>
        </>
      ) : null}

      <h2>Site-wide defaults</h2>
      <p>
        Some choices are made once for a whole site, not per element. Set these custom properties in
        your own CSS, on <code>:root</code> or on any container. theme.css sets none of them, so
        without them the look is the default one.
      </p>
      <ul>
        <li>
          <code>--kv-font-family-body</code> for body text, prose, buttons and navigation items, and{' '}
          <code>--kv-font-family-heading</code> for prose headings. Both fall back to{' '}
          <code>--kv-font-family-sans</code>. <code>--kv-font-family-system</code> is the system
          stack, for the end of your own.
        </li>
        <li>
          <code>--kv-card-padding-default</code> and <code>--kv-card-radius-default</code> for every
          card without a class. <code>kv-card--padding-md</code> and <code>kv-card--radius-lg</code>{' '}
          take a single card back to the theme’s steps.
        </li>
        <li>
          <code>--kv-button-min-block-size</code>, <code>--kv-button-padding-inline</code>,{' '}
          <code>--kv-button-font-size</code>, <code>--kv-button-font-weight</code> and{' '}
          <code>--kv-button-line-height</code> size buttons without touching other controls. They
          win over density, so keep the height at 24px or more (2.5.8), and 44px on resident-facing
          pages.
        </li>
        <li>
          <code>class=&quot;kv-compact&quot;</code> on <code>&lt;html&gt;</code> or{' '}
          <code>&lt;body&gt;</code> makes every control compact from 64rem, and 44px below.
        </li>
        <li>
          <code>--kv-color-heading</code> is the colour of prose headings, and{' '}
          <code>--kv-color-text</code> of body text. They’re semantic tokens, set in each theme, so
          change them per theme as in level 2 and run <code>checkThemeCss()</code>.
        </li>
      </ul>
      <pre>
        <code>{siteDefaultsCss}</code>
      </pre>
      <pre>
        <code>{siteDefaultsMarkup}</code>
      </pre>
      <p>
        theme.css reads each one where it’s used, with its own value as the fallback, so a default
        set on a container reaches everything inside it. A custom property is resolved where it’s
        declared, though: <code>var(--kv-card-padding-lg)</code> set on <code>:root</code> is the{' '}
        <code>:root</code> value, so the compact step-down inside a <code>kv-compact</code>{' '}
        container doesn’t reach it. That’s why the example sets the padding on <code>.kv-card</code>
        . Fixed values, such as <code>2.5rem</code> or a font name, have no such catch.
      </p>

      <h2>3. Replace the file</h2>
      <p>
        Copy theme.css into your project, edit it, and import your copy instead. Or skip it, and
        style the <code>kv-*</code> classes and the <code>data-*</code> state attributes with
        Tailwind or your own CSS. Either way, measure your colours with <code>checkThemeCss()</code>
        .
      </p>

      <h2>Your CSS always wins</h2>
      <p>
        Everything in theme.css is inside <code>@layer kv</code>, so any CSS you write outside a
        layer overrides it, whatever its specificity. This rule, unlayered in the Storybook canvas,
        squares the corners of the button below.
      </p>
      <pre>
        <code>{unlayeredCss}</code>
      </pre>
      <div className="kv-button-group">
        <Button className="my-button">Unlayered corners</Button>
      </div>
      {values ? (
        <p>
          This button’s corner radius is {values.unlayeredRadius}. theme.css gives buttons{' '}
          <code>--kv-radius-md</code>, 8px.
        </p>
      ) : null}
    </TokenPage>
  )
}

const meta = {
  title: 'Foundation/Theming',
  render: () => <ThemingPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

async function checkTheming(canvasElement: HTMLElement, fixedTheme?: ThemeName) {
  const canvas = within(canvasElement)
  const theme = fixedTheme ?? currentThemeName(canvasElement)
  // Every pair in use passes on the rebrand, measured live in this theme.
  await waitFor(() =>
    expect(
      canvas.getByText(
        new RegExp(`^${themeLabels[theme]}: \\d+ pairs in use\\. \\d+ pass, 0 fail\\.$`),
      ),
    ).toBeVisible(),
  )
  await expect(canvas.queryByRole('list', { name: 'Failing pairs' })).toBeNull()
}

export const CurrentTheme: Story = {
  name: 'Current theme',
  play: async ({ canvasElement }) => checkTheming(canvasElement),
}
export const Light: Story = fixedThemeStory('light', checkTheming)
export const Dark: Story = fixedThemeStory('dark', checkTheming)
export const LightHighContrast: Story = fixedThemeStory('light-contrast', checkTheming)
export const DarkHighContrast: Story = fixedThemeStory('dark-contrast', checkTheming)
