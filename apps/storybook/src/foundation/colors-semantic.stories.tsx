import type { Meta, StoryObj } from '@storybook/react-vite'
import { colorTokenNames, resolveThemeColors, themeEnvironment, themeNames } from '@kvirn-ui/theme'
import type { ColorTokenName, ThemeName } from '@kvirn-ui/theme'
import themeCss from '@kvirn-ui/theme/theme.css?raw'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { ColorsPage, TokenCode } from './colors-helpers.tsx'
import {
  currentThemeName,
  expectThemeApplied,
  forcedColorsEnvironment,
  isForcedColors,
  isThemeLoaded,
  readPaletteSteps,
  ScrollTable,
  Swatch,
  ThemeMissingNotice,
  themeLabels,
  useLiveValue,
} from './foundation-helpers.tsx'

// Foundation/Colors/Semantic tokens (docs/design/foundations-and-prose.md §6.6): the second
// tier of colour. All four themes and forced colours side by side, read from theme.css as it
// ships, so they can be compared at once. The palette step comes from the declaration, never
// from a hex lookup: two steps can share a value.

interface TokenGroup {
  heading: string
  tokens: readonly ColorTokenName[]
}

const tokenGroups: readonly TokenGroup[] = [
  { heading: 'Surfaces', tokens: ['canvas', 'surface', 'surface-raised'] },
  { heading: 'Borders', tokens: ['border-subtle', 'border-control', 'secondary', 'focus-ring'] },
  { heading: 'Text', tokens: ['text', 'text-muted', 'link', 'link-hover'] },
  { heading: 'Primary', tokens: ['primary', 'primary-hover', 'on-primary', 'primary-subtle'] },
  {
    heading: 'Status',
    tokens: [
      'danger',
      'danger-hover',
      'on-danger',
      'danger-subtle',
      'success',
      'success-subtle',
      'warning',
      'warning-subtle',
    ],
  },
]

/** The Use column of DESIGN.md, Colors. */
const tokenUses: Record<ColorTokenName, string> = {
  canvas: 'Page background',
  surface: 'Sections, sidebars, table headers, code',
  'surface-raised': 'Cards, popups, dialogs, hovered navigation items',
  'border-subtle': 'Hairline dividers and decorative outlines only',
  'border-control': 'Borders that identify a control (inputs, checkboxes)',
  secondary:
    'The secondary button’s edge. The secondary scale is the neutral steps by default, so it equals border-control until you give it a hue',
  'focus-ring': 'Focus indicator',
  text: 'Body text and headings',
  'text-muted': 'Secondary text, hints, metadata',
  link: 'Link text, badge text',
  'link-hover': 'Link hover and pressed',
  primary: 'Primary button background, selected state, current-page indicator',
  'primary-hover': 'Hover and pressed state of primary',
  'on-primary': 'Text and icons on primary',
  'primary-subtle':
    'Current navigation item, secondary button hover, selected rows, info backgrounds',
  danger: 'Errors, destructive actions',
  'danger-hover': 'Hover and pressed state of danger',
  'on-danger': 'Text and icons on danger',
  'danger-subtle': 'Error summary and message backgrounds',
  success: 'Confirmation, completed steps',
  'success-subtle': 'Confirmation panel backgrounds',
  warning: 'Warnings, deadlines',
  'warning-subtle': 'Warning panel backgrounds',
}

interface ThemeColumn {
  theme: ThemeName
  /** By token: the hex in this theme. */
  colors: Partial<Record<ColorTokenName, string>>
  /** By `--kv-color-*` property: the palette step it points at, such as `neutral-950`. */
  steps: Record<string, string>
}

/** theme.css as it ships, in each theme. Overrides on the page don't show here. */
const themeColumns: readonly ThemeColumn[] = themeNames.map((theme) => ({
  theme,
  colors: resolveThemeColors(themeCss, theme),
  steps: readPaletteSteps(themeEnvironment(theme)),
}))

/** In forced colours every token is a system colour, such as `Canvas`. */
const forcedColorsSteps = readPaletteSteps(forcedColorsEnvironment)

type CurrentColumn = ThemeName | 'forced-colors'

interface SemanticSnapshot {
  isLoaded: boolean
  current: CurrentColumn
}

const readSemantic = (element: HTMLElement): SemanticSnapshot => ({
  isLoaded: isThemeLoaded(element),
  current: isForcedColors(element) ? 'forced-colors' : currentThemeName(element),
})

const forcedColorsLabel = 'Forced colours'

const columnLabel = (label: string, isCurrent: boolean): string =>
  isCurrent ? `${label} (current)` : label

const notDefinedText = 'Not defined'

function ThemeCell({ column, token }: { column: ThemeColumn; token: ColorTokenName }): ReactNode {
  const hex = column.colors[token]
  const step = column.steps[`--kv-color-${token}`]
  if (hex === undefined || step === undefined) {
    return <td>{notDefinedText}</td>
  }
  return (
    <td>
      <Swatch color={hex} />
      <code>{step}</code> {hex}
    </td>
  )
}

function GroupTable({ group, current }: { group: TokenGroup; current: CurrentColumn }): ReactNode {
  return (
    <ScrollTable caption={`${group.heading}: palette step and hex in each theme`}>
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Use</th>
          {themeColumns.map(({ theme }) => (
            <th key={theme} scope="col">
              {columnLabel(themeLabels[theme], theme === current)}
            </th>
          ))}
          <th scope="col">{columnLabel(forcedColorsLabel, current === 'forced-colors')}</th>
        </tr>
      </thead>
      <tbody>
        {group.tokens.map((token) => (
          <tr key={token}>
            <th scope="row">
              <TokenCode name={token} />
            </th>
            <td>{tokenUses[token]}</td>
            {themeColumns.map((column) => (
              <ThemeCell key={column.theme} column={column} token={token} />
            ))}
            <td>
              <code>{forcedColorsSteps[`--kv-color-${token}`] ?? notDefinedText}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  )
}

function SemanticPage(): ReactNode {
  const [pageRef, snapshot] = useLiveValue<SemanticSnapshot, HTMLElement>(readSemantic)
  return (
    <ColorsPage title="Semantic tokens" pageRef={pageRef}>
      {snapshot === undefined ? null : snapshot.isLoaded ? (
        <>
          <p>
            The second tier of colour, <code>--kv-color-&lt;name&gt;</code>. Components use only
            these. Each theme points them at a palette step, and only the colours change between
            themes.
          </p>
          <p>
            Each cell names the palette step, such as <code>neutral-950</code>, and its hex. The
            column for the theme on this page is marked “(current)”. In forced colours the user’s
            system colours replace the theme, so that column names a system colour, and its value is
            up to the user.
          </p>
          <p>
            These values are read from <code>theme.css</code> as it ships, so all four themes show
            at once. Your own overrides don’t show here: the Text on surface page reads the colours
            live from the page, overrides included.
          </p>
          {tokenGroups.map((group) => (
            <Fragment key={group.heading}>
              <h2>{group.heading}</h2>
              <GroupTable group={group} current={snapshot.current} />
            </Fragment>
          ))}
        </>
      ) : (
        <ThemeMissingNotice />
      )}
    </ColorsPage>
  )
}

const meta = {
  title: 'Foundation/Colors/Semantic tokens',
  render: () => <SemanticPage />,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every token has a row, with its step and hex, and the current theme is named in text. */
async function expectSemanticTokens(canvasElement: HTMLElement, current: ThemeName) {
  const canvas = within(canvasElement)
  await waitFor(() =>
    expect(
      canvas.getAllByRole('columnheader', { name: `${themeLabels[current]} (current)` }),
    ).toHaveLength(tokenGroups.length),
  )
  await expect(canvas.getAllByRole('rowheader').map((header) => header.textContent)).toEqual(
    tokenGroups.flatMap((group) => group.tokens),
  )
  await expect(canvas.getAllByRole('rowheader')).toHaveLength(colorTokenNames.length)
  const canvasRow = canvas.getByRole('rowheader', { name: 'canvas' }).closest('tr')
  // Token, Use, then Light: white is #ffffff.
  await expect(canvasRow?.cells[2]).toHaveTextContent('white #ffffff')
  await expect(canvasRow?.cells[6]).toHaveTextContent('Canvas')
}

export const CurrentTheme: Story = {
  name: 'Current theme',
  play: async ({ canvasElement }) => {
    await expectSemanticTokens(canvasElement, currentThemeName(canvasElement))
  },
}

function fixedTheme(theme: ThemeName, name: string): Story {
  return {
    name,
    globals: { theme },
    play: async ({ canvasElement }) => {
      await expectThemeApplied(canvasElement, theme)
      await expectSemanticTokens(canvasElement, theme)
    },
  }
}

export const Light: Story = fixedTheme('light', 'Light')
export const Dark: Story = fixedTheme('dark', 'Dark')
export const LightHighContrast: Story = fixedTheme('light-contrast', 'Light, high contrast')
export const DarkHighContrast: Story = fixedTheme('dark-contrast', 'Dark, high contrast')

/** "None (unstyled)": the page says in text that there are no tokens to show. */
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
