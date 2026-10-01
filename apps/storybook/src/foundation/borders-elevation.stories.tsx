import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties, ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import {
  expectGlobalsThemeApplied,
  formatRatio,
  isForcedColors,
  ratioOf,
  readColor,
  readProperty,
  ScrollTable,
  Swatch,
  useLiveValue,
} from './foundation-helpers.tsx'
import { ContrastResult, ForcedColorsNotice, readTokenText, TokenPage } from './tokens-helpers.tsx'

// Foundation/Borders and elevation (docs/design/foundations-and-prose.md §6.6): line widths,
// the two border colours with their live ratios, and the elevation levels from DESIGN.md.

const widthUses: Record<string, string> = {
  '--kv-border-width': 'Hairlines and control edges',
  '--kv-indicator-width':
    'The current navigation item’s bar, status panel bars and blockquote bars',
}

const borderColors = [
  {
    token: 'border-subtle',
    use: 'Hairlines: dividers, card and panel edges. Decorative, so it has no minimum',
    minimum: undefined,
  },
  {
    token: 'border-control',
    use: 'The edge of every control, such as an input or a checkbox (1.4.11)',
    minimum: 3,
  },
  {
    token: 'secondary',
    use: 'The secondary button’s edge (1.4.11). The neutral steps until you give --kv-secondary-* a hue',
    minimum: 3,
  },
] as const

interface Level {
  level: number
  use: string
  surface: string
  border?: string
  shadow?: string
}

const levels: readonly Level[] = [
  { level: 0, use: 'the page', surface: 'canvas' },
  { level: 1, use: 'sections and sidebars', surface: 'surface', border: 'border-subtle' },
  { level: 2, use: 'cards', surface: 'surface-raised', border: 'border-subtle' },
  {
    level: 3,
    use: 'popups, menus and popovers',
    surface: 'surface-raised',
    border: 'border-subtle',
    shadow: '--kv-shadow-popup',
  },
  {
    level: 4,
    use: 'dialogs, with a backdrop',
    surface: 'surface-raised',
    border: 'border-subtle',
    shadow: '--kv-shadow-dialog',
  },
]

function readBorders(page: HTMLElement) {
  const canvas = readColor(page, '--kv-color-canvas')
  const surface = readColor(page, '--kv-color-surface')
  return {
    isForcedColors: isForcedColors(page),
    widths: Object.keys(widthUses).map((token) => ({
      token,
      value: readTokenText(page, token),
    })),
    colors: borderColors.map(({ token, use, minimum }) => {
      const color = readColor(page, `--kv-color-${token}`)
      return {
        token,
        use,
        minimum,
        color,
        onCanvas: ratioOf(color, canvas),
        onSurface: ratioOf(color, surface),
      }
    }),
    shadows: Object.fromEntries(
      levels.flatMap(({ shadow }) =>
        shadow === undefined ? [] : [[shadow, readProperty(page, shadow) ?? 'Not defined']],
      ),
    ) as Record<string, string>,
  }
}

const ratioText = (ratio: number | undefined) =>
  ratio === undefined ? 'Can’t measure' : formatRatio(ratio)

/** Each level is a card on the one before, labelled in text. */
function ElevationLevel({
  levelIndex,
  shadows,
}: {
  levelIndex: number
  shadows: Record<string, string>
}): ReactNode {
  const level = levels[levelIndex]
  if (level === undefined) {
    return null
  }
  const style: CSSProperties = {
    display: 'grid',
    gap: 'var(--kv-space-4)',
    backgroundColor: `var(--kv-color-${level.surface})`,
    ...(level.border === undefined
      ? {}
      : { border: `var(--kv-border-width) solid var(--kv-color-${level.border})` }),
    ...(level.shadow === undefined ? {} : { boxShadow: `var(${level.shadow})` }),
  }
  const shadowValue = level.shadow === undefined ? 'none' : (shadows[level.shadow] ?? 'none')
  return (
    <div
      className={level.level === 0 ? 'kv-story-elevation' : 'kv-story-elevation-card'}
      style={style}
      data-story-level={level.level}
    >
      <p>
        <strong>
          Level {level.level}: {level.use}
        </strong>
        <br />
        Surface <code>{level.surface}</code>, border <code>{level.border ?? 'none'}</code>, shadow{' '}
        {level.shadow === undefined ? null : (
          <>
            <code>{level.shadow}</code>:{' '}
          </>
        )}
        <code style={{ overflowWrap: 'anywhere' }}>{shadowValue}</code>
      </p>
      <ElevationLevel levelIndex={levelIndex + 1} shadows={shadows} />
    </div>
  )
}

function BordersElevationPage(): ReactNode {
  const [pageRef, values] = useLiveValue<ReturnType<typeof readBorders>, HTMLElement>(readBorders)
  return (
    <TokenPage title="Borders and elevation" pageRef={pageRef}>
      <p>
        Depth comes from the surface ladder (<code>canvas</code>, <code>surface</code>,{' '}
        <code>surface-raised</code>) and 1px hairlines, not from shadows. The look is flat and
        precise.
      </p>
      {values ? (
        <>
          <h2>Line widths</h2>
          <ScrollTable caption="Line width tokens">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
                <th scope="col">Use</th>
              </tr>
            </thead>
            <tbody>
              {values.widths.map(({ token, value }) => (
                <tr key={token}>
                  <th scope="row">
                    <code>{token}</code>
                  </th>
                  {/* The line is drawn under its value in text. */}
                  <td>
                    {value ?? 'Not defined'}
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'block',
                        inlineSize: 'var(--kv-space-12)',
                        marginBlockStart: 'var(--kv-space-2)',
                        borderBlockStart: `var(${token}) solid var(--kv-color-border-control)`,
                      }}
                    />
                  </td>
                  <td>{widthUses[token]}</td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>

          <h2>Border colours</h2>
          <p>
            Hairlines never identify a control. <code>border-subtle</code> is for dividers and the
            edges of cards and panels. Every control has a <code>border-control</code> edge, or{' '}
            <code>secondary</code> for the secondary button, which needs 3:1 against what’s next to
            it.
          </p>
          {values.isForcedColors ? <ForcedColorsNotice /> : null}
          <ScrollTable caption="Border colours, measured on this page">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Value</th>
                <th scope="col">On canvas</th>
                <th scope="col">On surface</th>
                <th scope="col">Minimum</th>
                <th scope="col">Result</th>
                <th scope="col">Use</th>
              </tr>
            </thead>
            <tbody>
              {values.colors.map(({ token, use, minimum, color, onCanvas, onSurface }) => (
                <tr key={token}>
                  <th scope="row">
                    <code>{token}</code>
                  </th>
                  <td>
                    {color === undefined ? (
                      'Can’t measure'
                    ) : (
                      <>
                        <Swatch color={color} />
                        {color}
                      </>
                    )}
                  </td>
                  <td>{ratioText(onCanvas)}</td>
                  <td>{ratioText(onSurface)}</td>
                  <td>{minimum === undefined ? 'None' : `${minimum}:1`}</td>
                  <td>
                    {minimum === undefined ? (
                      'Not required'
                    ) : (
                      <ContrastResult
                        ratio={
                          onCanvas === undefined || onSurface === undefined
                            ? undefined
                            : Math.min(onCanvas, onSurface)
                        }
                        minimum={minimum}
                      />
                    )}
                  </td>
                  <td>{use}</td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>

          <h2>Elevation</h2>
          <p>
            Five levels, each drawn on the one before. The shadows of levels 3 and 4 are{' '}
            <code>none</code> in the dark themes, where raised surfaces are lighter instead. A
            shadow is never the only boundary: shadows disappear in forced colours, so every level
            from 1 up keeps its border.
          </p>
          <div className="kv-not-prose">
            <ElevationLevel levelIndex={0} shadows={values.shadows} />
          </div>
        </>
      ) : null}
    </TokenPage>
  )
}

const meta = {
  title: 'Foundation/Borders and elevation',
  // One story, named like the page, and no Docs entry, so the sidebar shows a leaf.
  tags: ['!autodocs'],
  render: () => <BordersElevationPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The control border reaches 3:1 against the page, measured live (1.4.11). */
async function checkBorders(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const controlRow = await waitFor(() => {
    const row = canvas.getByRole('rowheader', { name: 'border-control' }).closest('tr')
    if (row === null) {
      throw new Error('No row for border-control')
    }
    return row
  })
  await waitFor(() => expect(within(controlRow).getByText('Passes')).toBeVisible())
}

/** The page in the toolbar's theme: each storybook Vitest project checks one (ADR-0023). */
export const BordersAndElevation: Story = {
  name: 'Borders and elevation',
  play: async ({ canvasElement, globals }) => {
    await expectGlobalsThemeApplied(canvasElement, globals)
    await checkBorders(canvasElement)
  },
}
