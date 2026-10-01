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
  isThemeLoaded,
  ratioOf,
  readColor,
  readPaletteSteps,
  rgbToHex,
  ScrollTable,
  ThemeMissingNotice,
  themeLabels,
  useLiveValue,
} from './foundation-helpers.tsx'
import {
  ContrastResult,
  fixedThemeStory,
  ForcedColorsNotice,
  formatMinimum,
  TokenPage,
} from './tokens-helpers.tsx'

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

/** The hex `primary` should have on the rebrand, per theme. */
const brandPrimary = (theme: ThemeName): string | undefined =>
  brandScale[themeSteps[theme]['--kv-color-primary']?.replace(/^primary-/, '') ?? '']

const unlayeredCss = `.my-button {
  border-radius: 0;
}`

const readColors = (element: Element) =>
  Object.fromEntries(
    colorTokenNames.map((token) => [token, readColor(element, `--kv-color-${token}`)]),
  ) as Record<ColorTokenName, string | undefined>

interface Pair {
  foreground: string
  background: string
  minimum: ContrastMinimum
  defaultRatio: number | undefined
  brandRatio: number | undefined
  isChanged: boolean
}

function readTheming(page: HTMLElement) {
  const brand = page.querySelector('.municipal-brand')
  const base = page.querySelector('[data-story-brand="default"]')
  const unlayered = page.querySelector('.my-button')
  if (!isThemeLoaded(page) || brand === null || base === null || unlayered === null) {
    return null
  }
  const theme = currentThemeName(page)
  const brandColors = readColors(brand)
  const baseColors = readColors(base)
  const color = (colors: Record<string, string | undefined>, token: string) => colors[token]
  const pairs = contrastRequirements[theme].map(({ foreground, background, minimum }): Pair => ({
    foreground,
    background,
    minimum,
    defaultRatio: ratioOf(color(baseColors, foreground), color(baseColors, background)),
    brandRatio: ratioOf(color(brandColors, foreground), color(brandColors, background)),
    isChanged:
      rebrandedTokens.has(foreground as ColorTokenName) ||
      rebrandedTokens.has(background as ColorTokenName),
  }))
  return {
    theme,
    isForcedColors: isForcedColors(page),
    pairs,
    failing: pairs.filter(
      ({ brandRatio, minimum }) => brandRatio === undefined || brandRatio < minimum,
    ),
    unlayeredRadius: getComputedStyle(unlayered).borderTopLeftRadius,
  }
}

const ratioText = (ratio: number | undefined) =>
  ratio === undefined ? 'Can’t measure' : formatRatio(ratio)

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
      <div data-kv-button-group="">
        <Button data-variant="primary">Send application</Button>
        <Button data-focus-visible="">Save draft (shown focused)</Button>
      </div>
      <p>
        You can <Link href={`#${headingId}`}>read the guidance</Link> first.
      </p>
      <nav aria-label={`${title} example`}>
        <ul data-kv-nav="">
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
      {values === null ? <ThemeMissingNotice /> : null}
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
              {values.failing.map(({ foreground, background, brandRatio, minimum }) => (
                <li key={`${foreground} on ${background}`}>
                  <code>{foreground}</code> on <code>{background}</code>: {ratioText(brandRatio)},
                  needs {formatMinimum(minimum)}
                </li>
              ))}
            </ul>
          ) : null}
          <ScrollTable
            caption={`Pairs in use that the rebrand changes, ${themeLabels[values.theme]}`}
          >
            <thead>
              <tr>
                <th scope="col">Foreground</th>
                <th scope="col">Background</th>
                <th scope="col">Kind</th>
                <th scope="col">Minimum</th>
                <th scope="col">Default</th>
                <th scope="col">Teal rebrand</th>
                <th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              {values.pairs
                .filter(({ isChanged }) => isChanged)
                .map(({ foreground, background, minimum, defaultRatio, brandRatio }) => (
                  <tr key={`${foreground} on ${background}`}>
                    <th scope="row">
                      <code>{foreground}</code>
                    </th>
                    <td>
                      <code>{background}</code>
                    </td>
                    <td>{minimum === 3 ? 'Non-text' : 'Text'}</td>
                    <td>{formatMinimum(minimum)}</td>
                    <td>{ratioText(defaultRatio)}</td>
                    <td>{ratioText(brandRatio)}</td>
                    <td>
                      <ContrastResult ratio={brandRatio} minimum={minimum} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </ScrollTable>
          <p>
            The same check runs on every theme in <code>vp run theme:check</code>, or with{' '}
            <code>checkThemeCss()</code> from <code>@kvirn-ui/theme</code> on your own file.
          </p>
        </>
      ) : null}

      <h2>3. Replace the file</h2>
      <p>
        Copy theme.css into your project, edit it, and import your copy instead. Or skip it, and
        style <code>[data-kv]</code> and the <code>data-*</code> attributes with Tailwind or your
        own CSS. Either way, measure your colours with <code>checkThemeCss()</code>.
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
      <div data-kv-button-group="">
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

  // The rebrand reaches the button, with the brand scale's step for this theme.
  const rebrand = within(await canvas.findByRole('region', { name: 'Teal rebrand' }))
  const base = within(canvas.getByRole('region', { name: 'Default' }))
  const brandButton = rebrand.getByRole('button', { name: 'Send application' })
  const baseButton = base.getByRole('button', { name: 'Send application' })
  const root = canvasElement.ownerDocument.documentElement
  // Read outside waitFor: readColor adds a probe element, and waitFor reruns on every change.
  const expectedBrandPrimary = brandPrimary(theme)
  const basePrimary = readColor(root, '--kv-color-primary')
  // The button's colour transition runs after a theme switch, so wait for it to end.
  await waitFor(() =>
    expect(rgbToHex(getComputedStyle(brandButton).backgroundColor)).toBe(expectedBrandPrimary),
  )
  await waitFor(() =>
    expect(rgbToHex(getComputedStyle(baseButton).backgroundColor)).toBe(basePrimary),
  )

  // Unlayered consumer CSS beats @layer kv.
  const unlayered = canvas.getByRole('button', { name: 'Unlayered corners' })
  await expect(unlayered).toHaveStyle({ borderTopLeftRadius: '0px' })
}

export const CurrentTheme: Story = {
  name: 'Current theme',
  play: async ({ canvasElement }) => checkTheming(canvasElement),
}
export const Light: Story = fixedThemeStory('light', checkTheming)
export const Dark: Story = fixedThemeStory('dark', checkTheming)
export const LightHighContrast: Story = fixedThemeStory('light-contrast', checkTheming)
export const DarkHighContrast: Story = fixedThemeStory('dark-contrast', checkTheming)
