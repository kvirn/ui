import type { Meta, StoryObj } from '@storybook/react-vite'
import { readRootProperties, themeEnvironment } from '@kvirn-ui/theme'
import type { ThemeName } from '@kvirn-ui/theme'
import themeCss from '@kvirn-ui/theme/theme.css?raw'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { ColorsPage, ratioText } from './colors-helpers.tsx'
import {
  expectThemeApplied,
  isThemeLoaded,
  readColor,
  ratioOf,
  ScrollTable,
  Swatch,
  ThemeMissingNotice,
  useLiveValue,
} from './foundation-helpers.tsx'

// Foundation/Colors/Palette (docs/design/foundations-and-prose.md §6.6): the raw scales, the
// first tier of colour. They're named by role, not hue, so a rebrand overrides one scale.
// Every hex is read live from the page, so an override on :root shows up. The white and black
// ratios help a rebrand pick a step for text or a fill.

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
    defaultHue: 'lavender',
    description:
      'Primary buttons, links, focus rings, selection and the current page. Linear’s lavender is 500.',
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

interface PaletteSnapshot {
  isLoaded: boolean
  /** By token, such as `--kv-neutral-500`: the live hex, or `undefined` if it can't be measured. */
  colors: Record<string, string | undefined>
}

function readPalette(element: HTMLElement): PaletteSnapshot {
  const tokens = [
    ...plainTokens.map((name) => `--kv-${name}`),
    ...scales.flatMap((scale) =>
      (scaleSteps.get(scale.name) ?? []).map((step) => `--kv-${scale.name}-${step}`),
    ),
  ]
  return {
    isLoaded: isThemeLoaded(element),
    colors: Object.fromEntries(tokens.map((token) => [token, readColor(element, token)])),
  }
}

function PaletteTable({
  caption,
  rows,
  colors,
}: {
  caption: ReactNode
  rows: readonly { label: string; token: string }[]
  colors: PaletteSnapshot['colors']
}): ReactNode {
  const white = colors['--kv-white']
  const black = colors['--kv-black']
  return (
    <ScrollTable caption={caption}>
      <thead>
        <tr>
          <th scope="col">Step</th>
          <th scope="col">Token</th>
          <th scope="col">Hex</th>
          <th scope="col">Ratio with white text</th>
          <th scope="col">Ratio with black text</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, token }) => {
          const hex = colors[token]
          return (
            <tr key={token}>
              <th scope="row">
                <Swatch color={`var(${token})`} />
                {label}
              </th>
              <td>
                <code>{token}</code>
              </td>
              <td>{hex ?? ratioText(undefined)}</td>
              <td>{ratioText(ratioOf(white, hex))}</td>
              <td>{ratioText(ratioOf(black, hex))}</td>
            </tr>
          )
        })}
      </tbody>
    </ScrollTable>
  )
}

function PalettePage(): ReactNode {
  const [pageRef, snapshot] = useLiveValue<PaletteSnapshot, HTMLElement>(readPalette)
  return (
    <ColorsPage title="Palette" pageRef={pageRef}>
      {snapshot === undefined ? null : snapshot.isLoaded ? (
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
            swapped scale can break contrast, so check the result on Colors/Text on surface or with{' '}
            <code>checkThemeCss()</code>.
          </p>
          <p>
            Every hex is read live from this page. White text means <code>--kv-white</code> and
            black text means <code>--kv-black</code>, so the ratios show which steps can carry text
            or a filled button in a rebrand. Text needs 4.5:1, and control edges and focus rings
            need 3:1.
          </p>
          {scales.map((scale) => (
            <ScaleSection key={scale.name} scale={scale} colors={snapshot.colors} />
          ))}
          <h2>White and black</h2>
          <p>
            <code>--kv-black</code> is Linear’s near-black canvas, not pure black.
          </p>
          <PaletteTable
            caption="White and black"
            rows={plainTokens.map((name) => ({ label: name, token: `--kv-${name}` }))}
            colors={snapshot.colors}
          />
        </>
      ) : (
        <ThemeMissingNotice />
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
      {/* The steps side by side, lightest first. Decorative: the table has every value. */}
      <div className="kv-story-strip" aria-hidden="true">
        {steps.map((step) => (
          <span key={step} style={{ backgroundColor: `var(--kv-${scale.name}-${step})` }} />
        ))}
      </div>
      <PaletteTable
        caption={
          <>
            {scale.heading} scale, <code>--kv-{scale.name}-*</code>
          </>
        }
        rows={steps.map((step) => ({ label: step, token: `--kv-${scale.name}-${step}` }))}
        colors={colors}
      />
    </>
  )
}

const meta = {
  title: 'Foundation/Colors/Palette',
  render: () => <PalettePage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every scale has a table of its steps, and the hex on the page is the one in theme.css. */
async function expectPalette(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await waitFor(() =>
    expect(canvas.getByRole('heading', { level: 2, name: 'Neutral' })).toBeVisible(),
  )
  for (const scale of scales) {
    await expect(canvas.getByRole('heading', { level: 2, name: scale.heading })).toBeVisible()
    const table = canvas.getByRole('table', {
      name: `${scale.heading} scale, --kv-${scale.name}-*`,
    })
    await expect(within(table).getAllByRole('rowheader')).toHaveLength(11)
  }
  const neutral = canvas.getByRole('table', { name: 'Neutral scale, --kv-neutral-*' })
  const row = within(neutral).getByRole('rowheader', { name: '500' }).closest('tr')
  await expect(row).toHaveTextContent(declaredPalette['--kv-neutral-500'] ?? 'missing')
  await expect(row).toHaveTextContent('--kv-neutral-500')
  // Secondary aliases neutral by default, so its steps show the neutral hexes.
  const secondary = canvas.getByRole('table', { name: 'Secondary scale, --kv-secondary-*' })
  const secondaryRow = within(secondary).getByRole('rowheader', { name: '500' }).closest('tr')
  await expect(secondaryRow).toHaveTextContent(declaredPalette['--kv-neutral-500'] ?? 'missing')
  await expect(canvas.getByText(/^Primary: lavender by default\./, { selector: 'p' })).toBeVisible()
}

export const CurrentTheme: Story = {
  name: 'Current theme',
  play: async ({ canvasElement }) => {
    await expectPalette(canvasElement)
  },
}

function fixedTheme(theme: ThemeName, name: string): Story {
  return {
    name,
    globals: { theme },
    play: async ({ canvasElement }) => {
      await expectThemeApplied(canvasElement, theme)
      await expectPalette(canvasElement)
    },
  }
}

export const Light: Story = fixedTheme('light', 'Light')
export const Dark: Story = fixedTheme('dark', 'Dark')
export const LightHighContrast: Story = fixedTheme('light-contrast', 'Light, high contrast')
export const DarkHighContrast: Story = fixedTheme('dark-contrast', 'Dark, high contrast')

/** "None (unstyled)": there are no tokens to read, and the page says so in text. */
export const WithoutTheme: Story = {
  name: 'Without theme',
  globals: { theme: 'none' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'theme.css is not loaded, so there are no tokens to show.',
      ),
    ).toBeVisible()
  },
}
