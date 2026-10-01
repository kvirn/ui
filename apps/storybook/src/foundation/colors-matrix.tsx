import { colorTokenNames, contrastRequirements } from '@kvirn-ui/theme'
import type { ColorTokenName, ThemeName } from '@kvirn-ui/theme'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import {
  ColorsPage,
  FailText,
  isTextMinimum,
  minimumText,
  ratioText,
  requirementFor,
  resultOf,
  tierText,
  TokenCode,
} from './colors-helpers.tsx'
import type { MeasuredRequirement } from './colors-helpers.tsx'
import {
  currentThemeName,
  isForcedColors,
  ratioOf,
  readColor,
  ScrollTable,
  Swatch,
  themeLabels,
  useLiveValue,
} from './foundation-helpers.tsx'

// The Text on surface story of Foundation/Colors (colors.stories.tsx,
// docs/design/foundations-and-prose.md §6.6 and §7): every text token on every background,
// measured live from the page, so an override shows up. The pairs in use come from
// contrast-requirements.ts, the list theme:check measures.
//
// Never colour only (1.4.1): each cell says its ratio, tier and use in text. A sample is drawn
// as text only at 4.5:1 or more. Below that the chip is a stripe, so the page never renders
// failing text and axe stays at 0 violations without weakening a rule.

const textTokens = [
  'text',
  'heading',
  'text-muted',
  'link',
  'link-hover',
  'danger',
  'success',
  'warning',
  'on-primary',
  'on-danger',
] as const satisfies readonly ColorTokenName[]

const backgroundTokens = [
  'canvas',
  'surface',
  'surface-raised',
  'primary-subtle',
  'danger-subtle',
  'success-subtle',
  'warning-subtle',
  'primary',
  'primary-hover',
  'danger',
  'danger-hover',
] as const satisfies readonly ColorTokenName[]

/** Below this, the sample is a stripe, never text (1.4.3). */
const sampleTextMinimum = 4.5

interface MatrixSnapshot {
  isForced: boolean
  theme: ThemeName
  /**
   * By token name: the live hex on this page, or `undefined` if it can't be measured. Keyed by
   * string, the type contrast-requirements.ts gives its pairs.
   */
  colors: Readonly<Record<string, string | undefined>>
}

const readMatrix = (element: HTMLElement): MatrixSnapshot => ({
  isForced: isForcedColors(element),
  theme: currentThemeName(element),
  colors: Object.fromEntries(
    colorTokenNames.map((token) => [token, readColor(element, `--kv-color-${token}`)]),
  ),
})

/** Every pair theme:check measures in this theme, with the page's colours. */
const measureRequirements = ({ theme, colors }: MatrixSnapshot): MeasuredRequirement[] =>
  contrastRequirements[theme].map((requirement) => ({
    ...requirement,
    ratio: ratioOf(colors[requirement.foreground], colors[requirement.background]),
  }))

/** "Aa" in the pair's colours from 4.5:1, otherwise a stripe in the foreground colour. */
function SampleChip({
  foreground,
  background,
  ratio,
}: {
  foreground: string
  background: string
  ratio: number
}): ReactNode {
  return (
    <span
      aria-hidden="true"
      className="kv-story-chip"
      style={{ color: foreground, backgroundColor: background }}
    >
      {ratio >= sampleTextMinimum ? 'Aa' : <span className="kv-story-chip-stripe" />}
    </span>
  )
}

function MatrixCell({
  snapshot,
  foreground,
  background,
}: {
  snapshot: MatrixSnapshot
  foreground: ColorTokenName
  background: ColorTokenName
}): ReactNode {
  const foregroundColor = snapshot.colors[foreground]
  const backgroundColor = snapshot.colors[background]
  const ratio = ratioOf(foregroundColor, backgroundColor)
  const requirement = requirementFor(snapshot.theme, foreground, background)
  const isFailing = requirement !== undefined && resultOf({ ...requirement, ratio }) === 'fail'
  return (
    <td className={requirement === undefined ? undefined : 'kv-story-in-use'}>
      <div className="kv-story-cell">
        {foregroundColor === undefined ||
        backgroundColor === undefined ||
        ratio === undefined ? null : (
          <SampleChip foreground={foregroundColor} background={backgroundColor} ratio={ratio} />
        )}
        <span>{ratioText(ratio)}</span>
        {ratio === undefined ? null : <span>{tierText(ratio)}</span>}
        <span>{requirement === undefined ? 'Not in use' : 'In use'}</span>
        {isFailing ? <FailText minimum={requirement.minimum} /> : null}
      </div>
    </td>
  )
}

function Summary({
  snapshot,
  measured,
}: {
  snapshot: MatrixSnapshot
  measured: readonly MeasuredRequirement[]
}): ReactNode {
  const failing = measured.filter((requirement) => resultOf(requirement) === 'fail')
  const passing = measured.filter((requirement) => resultOf(requirement) === 'pass')
  const unmeasured = measured.length - failing.length - passing.length
  return (
    <>
      <h2>Summary</h2>
      <p>
        Theme: {themeLabels[snapshot.theme]}
        {snapshot.isForced ? ', with forced colours' : ''}.
      </p>
      <p>
        {measured.length} pairs in use: {passing.length} pass, {failing.length} fail
        {unmeasured > 0 ? `, ${unmeasured} can’t be measured` : ''}.
      </p>
      {failing.length === 0 ? null : (
        <>
          <p>Failing pairs in use:</p>
          <ul>
            {failing.map(({ foreground, background, ratio, minimum }) => (
              <li key={`${foreground} ${background}`}>
                <TokenCode name={foreground} /> on <TokenCode name={background} />:{' '}
                {ratioText(ratio)}, needs {minimumText(minimum)}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

function Matrix({ snapshot }: { snapshot: MatrixSnapshot }): ReactNode {
  return (
    <ScrollTable caption={`Text tokens on backgrounds, ${themeLabels[snapshot.theme]}`}>
      <thead>
        <tr>
          <th scope="col">Text token</th>
          {backgroundTokens.map((background) => (
            <th key={background} scope="col">
              <TokenCode name={background} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {textTokens.map((foreground) => (
          <tr key={foreground}>
            <th scope="row">
              <TokenCode name={foreground} />
            </th>
            {backgroundTokens.map((background) => (
              <MatrixCell
                key={background}
                snapshot={snapshot}
                foreground={foreground}
                background={background}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  )
}

function PairsInUse({
  snapshot,
  measured,
}: {
  snapshot: MatrixSnapshot
  measured: readonly MeasuredRequirement[]
}): ReactNode {
  return (
    <ScrollTable caption={`Pairs in use, ${themeLabels[snapshot.theme]}`}>
      <thead>
        <tr>
          <th scope="col">Foreground</th>
          <th scope="col">Background</th>
          <th scope="col">Kind</th>
          <th scope="col">Minimum</th>
          <th scope="col">Ratio</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>
        {measured.map((requirement) => {
          const { foreground, background, minimum, ratio } = requirement
          const result = resultOf(requirement)
          const foregroundColor = snapshot.colors[foreground]
          const backgroundColor = snapshot.colors[background]
          return (
            <tr key={`${foreground} ${background}`}>
              <th scope="row">
                {foregroundColor === undefined ? null : <Swatch color={foregroundColor} />}
                <TokenCode name={foreground} />
              </th>
              <td>
                {backgroundColor === undefined ? null : <Swatch color={backgroundColor} />}
                <TokenCode name={background} />
              </td>
              <td>{isTextMinimum(minimum) ? 'Text' : 'Non-text'}</td>
              <td>{minimumText(minimum)}</td>
              <td>{ratioText(ratio)}</td>
              <td>
                {result === 'fail' ? <FailText minimum={minimum} /> : null}
                {result === 'pass' ? 'Pass' : null}
                {result === 'unmeasured' ? ratioText(undefined) : null}
              </td>
            </tr>
          )
        })}
      </tbody>
    </ScrollTable>
  )
}

export function TextOnSurfacePage(): ReactNode {
  const [pageRef, snapshot] = useLiveValue<MatrixSnapshot, HTMLElement>(readMatrix)
  if (snapshot === undefined) {
    return <ColorsPage title="Text on surface" pageRef={pageRef} />
  }
  const measured = measureRequirements(snapshot)
  const minimum =
    snapshot.theme === 'light-contrast' || snapshot.theme === 'dark-contrast' ? 7 : 4.5
  return (
    <ColorsPage title="Text on surface" pageRef={pageRef}>
      <p>
        Every text token on every background, measured live from this page, so your overrides show
        up. A pair is “In use” when <code>theme:check</code> measures it: in this theme, text in use
        needs {minimumText(minimum)}, and control edges and focus rings need 3:1.
      </p>
      {snapshot.isForced ? (
        <p>
          Forced colours are on. The user’s system colours replace the theme, so these ratios
          describe the user’s palette, not the theme.
        </p>
      ) : null}
      <Summary snapshot={snapshot} measured={measured} />
      <h2>Matrix</h2>
      <p>
        Rows are text tokens and columns are backgrounds. Each cell gives the ratio, its tier (7:1
        or more, 4.5:1 or more, 3:1 or more, or below 3:1), and whether the pair is in use. Pairs in
        use also have a frame. The sample shows “Aa” in the pair’s colours from 4.5:1, and only a
        line in the text colour below that.
      </p>
      <Matrix snapshot={snapshot} />
      <h2>Pairs in use</h2>
      <p>
        Every pair <code>theme:check</code> measures in this theme, including the non-text pairs at
        3:1: control borders, focus rings and the selected or current indicator.
      </p>
      <PairsInUse snapshot={snapshot} measured={measured} />
    </ColorsPage>
  )
}

/** The summary counts every pair in use, and the theme passes all of them. */
export async function expectTextOnSurface(canvasElement: HTMLElement, theme: ThemeName) {
  const canvas = within(canvasElement)
  const count = contrastRequirements[theme].length
  await waitFor(() =>
    expect(canvas.getByText(`${count} pairs in use: ${count} pass, 0 fail.`)).toBeVisible(),
  )
  await expect(canvas.getByText(`Theme: ${themeLabels[theme]}.`)).toBeVisible()

  const pairs = canvas.getByRole('table', { name: `Pairs in use, ${themeLabels[theme]}` })
  await expect(within(pairs).getAllByRole('row')).toHaveLength(count + 1)

  const matrix = canvas.getByRole('table', {
    name: `Text tokens on backgrounds, ${themeLabels[theme]}`,
  })
  await expect(within(matrix).getAllByRole('rowheader')).toHaveLength(textTokens.length)
  await expect(within(matrix).getAllByRole('cell')).toHaveLength(
    textTokens.length * backgroundTokens.length,
  )
}
