import { colorTokenNames, resolveThemeColors, themeEnvironment, themeNames } from '@kvirn-ui/theme'
import type { ColorTokenName, ThemeName } from '@kvirn-ui/theme'
import themeCss from '@kvirn-ui/theme/theme.css?raw'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { ColorsPage, TokenCode } from './colors-helpers.tsx'
import {
  currentThemeName,
  forcedColorsEnvironment,
  isForcedColors,
  readPaletteSteps,
  ScrollTable,
  Swatch,
  themeLabels,
  useLiveValue,
} from './foundation-helpers.tsx'

// The Semantic tokens story of Foundation/Colors (colors.stories.tsx,
// docs/design/foundations-and-prose.md §6.6): the second tier of colour. All four themes and
// forced colours side by side, read from theme.css as it ships, so they can be compared at once.
// The palette step comes from the declaration, never from a hex lookup: two steps can share a
// value.

interface TokenGroup {
  heading: string
  tokens: readonly ColorTokenName[]
}

const tokenGroups: readonly TokenGroup[] = [
  { heading: 'Surfaces', tokens: ['canvas', 'surface', 'surface-raised'] },
  {
    heading: 'Borders',
    tokens: ['border-subtle', 'border-control', 'border-focus', 'secondary', 'focus-ring'],
  },
  { heading: 'Text', tokens: ['text', 'heading', 'text-muted', 'link', 'link-hover'] },
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
  canvas: 'Page background, and a canvas section (`kv-section--canvas`)',
  surface: 'Sections (`Section`), sidebars, table headers, code',
  'surface-raised': 'Cards, popups, dialogs, hovered navigation items',
  'border-subtle': 'Hairline dividers and decorative outlines only',
  'border-control': 'Borders that identify a control (inputs, checkboxes)',
  'border-focus': 'A field’s edge while it has focus, a click included',
  secondary:
    'The secondary button’s edge. The secondary scale is the neutral steps by default, so it equals border-control until you give it a hue',
  'focus-ring': 'Focus indicator',
  text: 'Body text',
  heading: 'Headings in prose. The same step as text by default',
  'text-muted':
    'Secondary text and metadata. Not help texts: a help text is an instruction, so it uses text',
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
  current: CurrentColumn
}

const readSemantic = (element: HTMLElement): SemanticSnapshot => ({
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

export function SemanticPage(): ReactNode {
  const [pageRef, snapshot] = useLiveValue<SemanticSnapshot, HTMLElement>(readSemantic)
  return (
    <ColorsPage title="Semantic tokens" pageRef={pageRef}>
      {snapshot === undefined ? null : (
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
      )}
    </ColorsPage>
  )
}

/** Every token has a row header, and the current theme is named in text, not only shown. */
export async function expectSemanticTokens(canvasElement: HTMLElement, current: ThemeName) {
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
}
