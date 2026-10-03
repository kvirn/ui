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
  'heading',
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

// The surfaces content sits on: pages, sections (`surface` and `canvas`), cards, popups and
// dialogs (`surface-raised`). Sections need no pair of their own (ADR-0044).
const plainBackgrounds = ['canvas', 'surface', 'surface-raised'] as const
/** The status backgrounds of Notifications, where prose and its links can sit (ADR-0018). */
const statusBackgrounds = ['danger-subtle', 'success-subtle', 'warning-subtle'] as const
/**
 * Notifications (design spec docs/design/notification.md §6.6, ADR-0047): info uses
 * `primary-subtle`. Every pair a Notification needs is already required below, so this adds
 * none. `checkButtonEdges` measures a button's tinted edge on these too (Actions hold buttons).
 */
export const notificationBackgrounds = ['primary-subtle', ...statusBackgrounds] as const

/**
 * Text on every background it's used on (DESIGN.md, Colors; ADR-0014). `heading` can be
 * given its own colour, so it's held to everything body `text` is held to.
 */
const textPairs: readonly ColorPair[] = [
  ...(
    ['text', 'heading', 'text-muted', 'link', 'link-hover', 'danger', 'success', 'warning'] as const
  ).flatMap((foreground) =>
    plainBackgrounds.map((background): ColorPair => [foreground, background]),
  ),
  ...(['text', 'heading'] as const).flatMap((foreground) =>
    notificationBackgrounds.map((background): ColorPair => [foreground, background]),
  ),
  ['text-muted', 'primary-subtle'],
  ['link', 'primary-subtle'],
  ['link-hover', 'primary-subtle'],
  // Status words in the cells of a selected table row (docs/design/table.md §6.6).
  ['danger', 'primary-subtle'],
  ['success', 'primary-subtle'],
  ['warning', 'primary-subtle'],
  // Prose on notifications: muted metadata, links and hovered links (ADR-0018).
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
  // Hovered and pressed filled buttons on every surface they sit on: pages, sections, cards,
  // dialogs and popups (1.4.11).
  // - Primary: the edge is a `primary` border in that state (ADR-0021), and `primary` is
  //   required on every plain background above. `primary-hover` is also required where it
  //   reaches 3:1 on its own. It isn't required on `surface-raised`, where it's 2.98:1 in dark:
  //   that gap is why the border exists. A theme test checks the border.
  // - Danger: the border is transparent, so the hovered fill is the edge.
  ['primary-hover', 'canvas'],
  ['primary-hover', 'surface'],
  ...plainBackgrounds.map((background): ColorPair => ['danger-hover', background]),
  // Controls, blockquote bars and focus rings on notifications (ADR-0018).
  ...(['border-control', 'secondary', 'focus-ring'] as const).flatMap((foreground) =>
    statusBackgrounds.map((background): ColorPair => [foreground, background]),
  ),
  // Form fields (ADR-0029, docs/design/form-fields.md §6.12). The invalid edge is `danger`
  // at 2px, so it's its own 3:1 requirement, kept even if `danger` is ever split into a text
  // and an edge token. Controls sit in notifications too, next to `border-control` there. A checked
  // box inside a notification is `primary`, which `primary-subtle` already requires.
  ...plainBackgrounds.map((background): ColorPair => ['danger', background]),
  ...notificationBackgrounds.map((background): ColorPair => ['danger', background]),
  ...statusBackgrounds.map((background): ColorPair => ['primary', background]),
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
