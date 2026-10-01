import { contrastRatio, readRootProperties, themeEnvironment } from '@kvirn-ui/theme'
import type { ThemeEnvironment, ThemeName } from '@kvirn-ui/theme'
import themeCss from '@kvirn-ui/theme/theme.css?raw'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { expect, waitFor } from 'storybook/test'

// Shared by the Foundation pages (docs/design/foundations-and-prose.md §6.6). Storybook
// tooling only: @kvirn-ui/theme stays React-free. Values are read live from the story's own
// element, not from :root, so a scoped override shows up. Maintainer pages are in English.

export const themeLabels: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  'light-contrast': 'Light, high contrast',
  'dark-contrast': 'Dark, high contrast',
}

/** `rgb(94, 106, 210)` as `#5e6ad2`. Anything translucent or not sRGB can't be measured. */
export function rgbToHex(color: string): string | undefined {
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(color.trim())
  if (match === null || (match[4] !== undefined && Number(match[4]) < 1)) {
    return undefined
  }
  return `#${match
    .slice(1, 4)
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')}`
}

/** A custom property's value on an element, or `undefined` when it isn't defined. */
export function readProperty(element: Element, property: string): string | undefined {
  const value = getComputedStyle(element).getPropertyValue(property).trim()
  return value === '' ? undefined : value
}

/**
 * A colour custom property, resolved by the browser through a probe element's `color` (this
 * handles hex, `var()` and system colours), as hex. `undefined` if it's missing or can't be
 * measured.
 */
export function readColor(element: Element, property: string): string | undefined {
  if (readProperty(element, property) === undefined) {
    return undefined
  }
  const probe = element.ownerDocument.createElement('span')
  probe.style.display = 'none'
  probe.style.color = `var(${property})`
  element.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return rgbToHex(color)
}

/** A length custom property in px, measured by the browser. */
export function readLength(element: Element, property: string): number | undefined {
  if (readProperty(element, property) === undefined) {
    return undefined
  }
  const probe = element.ownerDocument.createElement('span')
  probe.style.display = 'block'
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.inlineSize = `var(${property})`
  element.append(probe)
  const width = probe.getBoundingClientRect().width
  probe.remove()
  return width
}

export const formatRatio = (ratio: number): string => `${ratio.toFixed(2)}:1`

export const ratioOf = (foreground: string | undefined, background: string | undefined) =>
  foreground === undefined || background === undefined
    ? undefined
    : contrastRatio(foreground, background)

/** Whether theme.css is on the page. "None (unstyled)" removes it. */
export const isThemeLoaded = (element: Element): boolean =>
  readProperty(element.ownerDocument.documentElement, '--kv-color-primary') !== undefined

export const isForcedColors = (element: Element): boolean =>
  element.ownerDocument.defaultView?.matchMedia('(forced-colors: active)').matches ?? false

/** The theme that `<html>` shows: from KvirnProvider's attributes, or else from the OS. */
export function currentThemeName(element: Element): ThemeName {
  const root = element.ownerDocument.documentElement
  const view = element.ownerDocument.defaultView
  const isDark =
    (root.getAttribute('data-kv-color-scheme') ??
      (view?.matchMedia('(prefers-color-scheme: dark)').matches === true ? 'dark' : 'light')) ===
    'dark'
  const isMore =
    (root.getAttribute('data-kv-contrast') ??
      (view?.matchMedia('(prefers-contrast: more)').matches === true ? 'more' : 'standard')) ===
    'more'
  if (isDark) {
    return isMore ? 'dark-contrast' : 'dark'
  }
  return isMore ? 'light-contrast' : 'light'
}

/**
 * A number that changes whenever what the page shows may have changed: the theme attributes
 * on `<html>`, theme.css added or removed, or the OS settings.
 */
export function useThemeVersion(): number {
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const bump = () => setVersion((current) => current + 1)
    const observer = new MutationObserver(bump)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-kv-color-scheme', 'data-kv-contrast', 'style'],
    })
    observer.observe(document.head, { childList: true })
    const queries = [
      '(prefers-color-scheme: dark)',
      '(prefers-contrast: more)',
      '(forced-colors: active)',
      '(prefers-reduced-motion: reduce)',
    ].map((query) => window.matchMedia(query))
    for (const query of queries) {
      query.addEventListener('change', bump)
    }
    window.addEventListener('resize', bump)
    // The canvas selects a fixed theme in its own effect, after this component's effects.
    const frame = window.requestAnimationFrame(bump)
    return () => {
      observer.disconnect()
      for (const query of queries) {
        query.removeEventListener('change', bump)
      }
      window.removeEventListener('resize', bump)
      window.cancelAnimationFrame(frame)
    }
  }, [])
  return version
}

/**
 * Reads values from an element after every render the theme could have changed. `read` must
 * be stable (defined at module level).
 */
export function useLiveValue<Value, ElementType extends HTMLElement = HTMLDivElement>(
  read: (element: ElementType) => Value,
): [RefObject<ElementType | null>, Value | undefined] {
  const ref = useRef<ElementType>(null)
  const version = useThemeVersion()
  const [value, setValue] = useState<Value>()
  useLayoutEffect(() => {
    if (ref.current !== null) {
      setValue(read(ref.current))
    }
  }, [read, version])
  return [ref, value]
}

/**
 * The palette step each `--kv-*` property points at in theme.css, such as `neutral-950`. It
 * parses the file instead of looking a hex value up, because two steps can share a value.
 */
export function readPaletteSteps(environment: ThemeEnvironment): Record<string, string> {
  const palette = readRootProperties(themeCss, themeEnvironment('light'))
  const stepNames = Object.keys(palette)
    .filter((property) => /^--kv-(?:white|black|[a-z]+-\d+)$/.test(property))
    .map((property) => property.slice('--kv-'.length))
  // Each step resolves to its own name, so the semantic tokens resolve to step names.
  const named = `${themeCss}\n:root { ${stepNames.map((step) => `--kv-${step}: ${step};`).join(' ')} }`
  return readRootProperties(named, environment)
}

export const forcedColorsEnvironment: ThemeEnvironment = {
  attributes: {},
  media: {
    'prefers-color-scheme': 'light',
    'prefers-contrast': 'no-preference',
    'forced-colors': 'active',
  },
}

/** A Foundation page: English maintainer text, in prose, wider than the measure for tables. */
export function FoundationPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}): ReactNode {
  return (
    <main lang="en" className="kv-story-foundation" data-kv-prose="">
      <h1>{title}</h1>
      {children}
    </main>
  )
}

/** With "None (unstyled)" there are no tokens to read. Said in text, nothing throws. */
export function ThemeMissingNotice(): ReactNode {
  return <p>theme.css is not loaded, so there are no tokens to show.</p>
}

/** Keyboard users scroll it, so it's in the Tab order (2.1.1, 1.4.10). */
export const scrollRegionTabIndex = 0

/**
 * A table in a labelled, focusable scroll region (`data-kv-scroll-region`): a `<section>`
 * named by the caption, so it's a region landmark.
 */
export function ScrollTable({
  caption,
  children,
}: {
  caption: ReactNode
  children: ReactNode
}): ReactNode {
  const captionId = useId()
  return (
    <section data-kv-scroll-region="" aria-labelledby={captionId} tabIndex={scrollRegionTabIndex}>
      <table>
        <caption id={captionId}>{caption}</caption>
        {children}
      </table>
    </section>
  )
}

/** A colour sample. Decorative: its value is always in text next to it. */
export function Swatch({ color }: { color: string }): ReactNode {
  return <span aria-hidden="true" className="kv-story-swatch" style={{ backgroundColor: color }} />
}

/** A link to another story, from inside the preview frame. */
export const storyHref = (storyId: string): string => `./?path=/story/${storyId}`

const fixedThemeAttributes: Record<ThemeName, readonly ['light' | 'dark', string]> = {
  light: ['light', 'standard'],
  dark: ['dark', 'standard'],
  'light-contrast': ['light', 'more'],
  'dark-contrast': ['dark', 'more'],
}

/** The fixed theme story's theme reached `<html>`. */
export async function expectThemeApplied(canvasElement: HTMLElement, theme: ThemeName) {
  const root = canvasElement.ownerDocument.documentElement
  const [colorScheme, contrast] = fixedThemeAttributes[theme]
  await waitFor(() => expect(root).toHaveAttribute('data-kv-color-scheme', colorScheme))
  await expect(root).toHaveAttribute('data-kv-contrast', contrast)
}
