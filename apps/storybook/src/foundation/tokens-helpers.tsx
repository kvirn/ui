import { readRootProperties, themeEnvironment } from '@kvirn-ui/theme'
import type { ContrastMinimum, ThemeName } from '@kvirn-ui/theme'
import themeCss from '@kvirn-ui/theme/theme.css?raw'
import type { ReactNode, Ref } from 'react'
import { expectThemeApplied, readLength, readProperty, themeLabels } from './foundation-helpers.tsx'

// Shared by the non-colour Foundation pages (spacing, radius, borders and elevation, focus
// ring, motion, density, theming). docs/design/foundations-and-prose.md §6.6. Storybook
// tooling only. Values are read live from the page; theme.css is only parsed for the list of
// token names, so a token added to the file shows up here without a code change.

/** The `--kv-*` properties theme.css defines on `:root` whose name matches, in source order. */
export function themeTokenNames(pattern: RegExp): string[] {
  return Object.keys(readRootProperties(themeCss, themeEnvironment('light'))).filter((property) =>
    pattern.test(property),
  )
}

/** `16` as "16px", `31.5` as "31.5px". */
export const formatPixels = (pixels: number): string => `${Number(pixels.toFixed(2))}px`

export const formatMinimum = (minimum: ContrastMinimum): string => `${minimum}:1`

const lengthPattern = /^-?[\d.]+(?:rem|em|px|ch)$/

/**
 * A token's value as theme.css computes it, plus its size in px when it's a length:
 * "1.25rem (20px)". `undefined` when the token isn't defined here.
 */
export function readTokenText(element: Element, property: string): string | undefined {
  const value = readProperty(element, property)
  if (value === undefined) {
    return undefined
  }
  if (!lengthPattern.test(value) || value.endsWith('px')) {
    return value
  }
  const pixels = readLength(element, property)
  return pixels === undefined ? value : `${value} (${formatPixels(pixels)})`
}

/** A cross in a circle, next to the word "Fails": never colour alone (1.4.1). */
function FailIcon(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx={8} cy={8} r={6.5} />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" />
    </svg>
  )
}

/** Whether a measured ratio meets its minimum, in words. */
export function ContrastResult({
  ratio,
  minimum,
}: {
  ratio: number | undefined
  minimum: ContrastMinimum
}): ReactNode {
  if (ratio === undefined) {
    return <>Can’t measure</>
  }
  if (ratio >= minimum) {
    return <>Passes</>
  }
  return (
    <span className="kv-story-fail">
      <FailIcon />
      Fails: needs {formatMinimum(minimum)}
    </span>
  )
}

/** Forced colours replace the theme, so a measured ratio describes the user's palette. */
export function ForcedColorsNotice(): ReactNode {
  return (
    <p>
      Forced colours are active. The system colours replace the theme, so the ratios on this page
      describe your own palette, not theme.css.
    </p>
  )
}

/**
 * A Foundation page whose root element is read live (`useLiveValue`). The same markup as
 * `FoundationPage`, with a ref: wrapping the content in another element would break the
 * measure rules in story-canvas.css, which match the page's direct children.
 */
export function TokenPage({
  title,
  pageRef,
  children,
}: {
  title: string
  pageRef: Ref<HTMLElement>
  children: ReactNode
}): ReactNode {
  return (
    <main ref={pageRef} lang="en" className="kv-story-foundation kv-prose">
      <h1>{title}</h1>
      {children}
    </main>
  )
}

/**
 * A story fixed to one theme: the axe gate for colour contrast in that theme. `check` runs
 * after the theme has reached `<html>`.
 */
export function fixedThemeStory(
  theme: ThemeName,
  check?: (canvasElement: HTMLElement, theme: ThemeName) => Promise<void>,
) {
  return {
    name: themeLabels[theme],
    globals: { theme },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      await expectThemeApplied(canvasElement, theme)
      await check?.(canvasElement, theme)
    },
  }
}
