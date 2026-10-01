/**
 * The four themes (ADR-0006) and every colour pair `theme:check` measures in them. The
 * colours themselves live in `theme.css`, the source of truth (ADR-0013).
 */
export const themeNames = ['light', 'dark', 'light-contrast', 'dark-contrast'] as const
export type ThemeName = (typeof themeNames)[number]

/** Text 4.5:1 (1.4.3), UI and focus 3:1 (1.4.11, 2.4.13), high-contrast text 7:1 (1.4.6). */
export type ContrastMinimum = 3 | 4.5 | 7

export interface ContrastRequirement {
  foreground: string
  background: string
  minimum: ContrastMinimum
}

/** The semantic colours, `--kv-color-<name>` in `theme.css`. Every theme defines all of them. */
export const colorTokenNames = [
  'canvas',
  'surface',
  'surface-raised',
  'border-subtle',
  'border-control',
  'secondary',
  'text',
  'text-muted',
  'primary',
  'primary-hover',
  'on-primary',
  'primary-subtle',
  'link',
  'link-hover',
  'focus-ring',
  'danger',
  'danger-hover',
  'on-danger',
  'danger-subtle',
  'success',
  'success-subtle',
  'warning',
  'warning-subtle',
] as const
export type ColorTokenName = (typeof colorTokenNames)[number]

type ColorPair = readonly [foreground: ColorTokenName, background: ColorTokenName]

const plainBackgrounds = ['canvas', 'surface', 'surface-raised'] as const
/** The status panels, where prose and its links can sit (ADR-0018). */
const statusBackgrounds = ['danger-subtle', 'success-subtle', 'warning-subtle'] as const

/** Text on every background it's used on (DESIGN.md, Colors; ADR-0014). */
const textPairs: readonly ColorPair[] = [
  ...(
    ['text', 'text-muted', 'link', 'link-hover', 'danger', 'success', 'warning'] as const
  ).flatMap((foreground) =>
    plainBackgrounds.map((background): ColorPair => [foreground, background]),
  ),
  ['text', 'primary-subtle'],
  ['text', 'danger-subtle'],
  ['text', 'success-subtle'],
  ['text', 'warning-subtle'],
  ['text-muted', 'primary-subtle'],
  ['link', 'primary-subtle'],
  ['link-hover', 'primary-subtle'],
  // Prose on status panels: muted metadata, links and hovered links (ADR-0018).
  ...(['text-muted', 'link', 'link-hover'] as const).flatMap((foreground) =>
    statusBackgrounds.map((background): ColorPair => [foreground, background]),
  ),
  ['danger', 'danger-subtle'],
  ['success', 'success-subtle'],
  ['warning', 'warning-subtle'],
  // Labels on filled buttons, at rest and while hovered or pressed.
  ['on-primary', 'primary'],
  ['on-primary', 'primary-hover'],
  ['on-danger', 'danger'],
  ['on-danger', 'danger-hover'],
]

/**
 * Control boundaries, focus rings and the selected or current indicator (1.4.11, 2.4.13),
 * including `primary` on `primary-subtle` for the current navigation item's bar. `secondary`
 * is the secondary button's edge, so it needs everything `border-control` does.
 */
const nonTextPairs: readonly ColorPair[] = [
  ...(['border-control', 'secondary', 'focus-ring', 'primary'] as const).flatMap((foreground) =>
    [...plainBackgrounds, 'primary-subtle' as const].map((background): ColorPair => [
      foreground,
      background,
    ]),
  ),
  // A hovered primary button's edge against the page.
  ['primary-hover', 'canvas'],
  ['primary-hover', 'surface'],
  // Controls, blockquote bars and focus rings on status panels (ADR-0018).
  ...(['border-control', 'secondary', 'focus-ring'] as const).flatMap((foreground) =>
    statusBackgrounds.map((background): ColorPair => [foreground, background]),
  ),
]

const isContrastTheme = (themeName: ThemeName) =>
  themeName === 'light-contrast' || themeName === 'dark-contrast'

function requirementsFor(themeName: ThemeName): ContrastRequirement[] {
  const textMinimum: ContrastMinimum = isContrastTheme(themeName) ? 7 : 4.5
  return [
    ...textPairs.map(([foreground, background]) => ({
      foreground,
      background,
      minimum: textMinimum,
    })),
    ...nonTextPairs.map(([foreground, background]): ContrastRequirement => ({
      foreground,
      background,
      minimum: 3,
    })),
  ]
}

export const contrastRequirements: Record<ThemeName, ContrastRequirement[]> = {
  light: requirementsFor('light'),
  dark: requirementsFor('dark'),
  'light-contrast': requirementsFor('light-contrast'),
  'dark-contrast': requirementsFor('dark-contrast'),
}
