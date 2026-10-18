import { expect } from 'storybook/test'

// Play-function checks shared by the component stories, which the Storybook preview styles
// with @kvirn-ui/theme/theme.css. Story-only, so it lives in the Storybook app.
// Functionality and WCAG only: the look is reviewed visually, not asserted.

/** At least 24 × 24 CSS px, the 2.5.8 Target Size (Minimum). */
export async function expectMinimumTargetSize(element: Element) {
  const { width, height } = element.getBoundingClientRect()
  await expect(width).toBeGreaterThanOrEqual(24)
  await expect(height).toBeGreaterThanOrEqual(24)
}

/** Every top bar is a band at least 48 CSS px tall, its items centred in it. */
export async function expectTopBarBandHeight(root: Element) {
  const bars = root.querySelectorAll('.kv-top-bar')
  await expect(bars.length).toBeGreaterThan(0)
  for (const bar of bars) {
    await expect(bar.getBoundingClientRect().height).toBeGreaterThanOrEqual(48)
  }
}

/** Every bar item in a top bar is at least 24 × 24 CSS px, none skipped (2.5.8). A link in a sentence is inline, which 2.5.8 exempts. */
export async function expectTopBarTargetSizes(root: Element) {
  await expectTopBarBandHeight(root)
  const items = root.querySelectorAll('.kv-top-bar a:not(p a), .kv-top-bar button')
  await expect(items.length).toBeGreaterThan(0)
  for (const item of items) {
    await expectMinimumTargetSize(item)
  }
}

// Hidden until focus by clipping to a 1 CSS px box (technique C7, a skip link): the content is
// not on screen, so a sweep does not read it as clipped or overflowing. Nothing larger is exempt.
const isClippedAway = (element: Element, root: Element) => {
  for (let node: Element | null = element; node && node !== root; node = node.parentElement) {
    const { width, height } = node.getBoundingClientRect()
    if (width <= 1 && height <= 1) return true
  }
  return false
}

/** Nothing inside the element is wider than it (1.4.10). A box clipped to 1 CSS px is skipped. */
export async function expectNoHorizontalOverflow(element: HTMLElement) {
  await expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth)
  for (const child of element.querySelectorAll<HTMLElement>('*')) {
    if (isClippedAway(child, element)) continue
    await expect(child.getBoundingClientRect().right).toBeLessThanOrEqual(
      element.getBoundingClientRect().right + 0.5,
    )
  }
}

const focusableSelector =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'

const isDrawn = (
  style: CSSStyleDeclaration,
  side: 'top' | 'right' | 'bottom' | 'left' | 'outline',
) => {
  const property = side === 'outline' ? 'outline' : `border-${side}`
  return (
    style.getPropertyValue(`${property}-style`) !== 'none' &&
    Number.parseFloat(style.getPropertyValue(`${property}-width`)) > 0 &&
    style.getPropertyValue(`${property}-color`) !== 'rgba(0, 0, 0, 0)'
  )
}

const backgroundBehind = (element: Element) => {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const { backgroundColor } = getComputedStyle(node)
    if (backgroundColor !== 'rgba(0, 0, 0, 0)') return backgroundColor
  }
  return 'rgba(0, 0, 0, 0)'
}

/** The Playwright context option took effect: the page really is in forced-colors mode. */
export async function expectForcedColorsActive() {
  await expect(window.matchMedia('(forced-colors: active)').matches).toBe(true)
}

/**
 * Forced colours (1.4.11): every focusable part keeps a visible boundary (a drawn border or
 * outline, not `transparent`), and a part with keyboard focus keeps a visible focus indicator.
 */
export async function expectVisibleInForcedColors(root: Element) {
  await expectForcedColorsActive()
  for (const element of root.querySelectorAll<HTMLElement>(focusableSelector)) {
    const style = getComputedStyle(element)
    const hasBoundary =
      (['top', 'right', 'bottom', 'left'] as const).some((side) => isDrawn(style, side)) ||
      isDrawn(style, 'outline')
    // A text-only control (the link look) has no boundary: its text must stand out from what is
    // behind it instead, which is what 1.4.11 asks of an identifying part.
    await expect(hasBoundary || style.color !== backgroundBehind(element)).toBe(true)
  }
  const focused = document.activeElement
  if (focused && root.contains(focused) && focused.matches(':focus-visible')) {
    await expect(isDrawn(getComputedStyle(focused), 'outline')).toBe(true)
  }
}

/** The Playwright context option took effect: the page really asks for reduced motion. */
export async function expectReducedMotionActive() {
  await expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
}

// A reduced duration is effectively instant: 1 ms leaves room for the 0.01 ms most resets use.
const reducedDurationLimit = 1

/**
 * Reduced motion (2.3.3): no animation or transition still running is longer than the reduced
 * duration or loops.
 */
export async function expectNoMotionInReducedMotion() {
  await expectReducedMotionActive()
  for (const animation of document.getAnimations()) {
    if (animation.playState !== 'running') continue
    const { endTime, iterations } = animation.effect?.getComputedTiming() ?? {}
    await expect(iterations).not.toBe(Number.POSITIVE_INFINITY)
    await expect(Number(endTime)).toBeLessThanOrEqual(reducedDurationLimit)
  }
}

/** The Playwright viewport took effect: the layout viewport is the 320 CSS px of 1.4.10. */
export async function expectReflowViewport() {
  await expect(document.documentElement.clientWidth).toBe(320)
}

/** The 1.4.12 spacing, as the SC's bookmarklet sets it. */
const textSpacingCss = `
  * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-block-end: 2em !important; }
`

/**
 * Text spacing (1.4.12): with the spacing applied, no element that clips its content (overflow
 * hidden or clip, or a fixed height) has more content than box. A box clipped to 1 CSS px is skipped.
 */
export async function expectNoClippedTextWithSpacing(root: Element) {
  const style = document.createElement('style')
  style.textContent = textSpacingCss
  document.head.append(style)
  try {
    for (const element of root.querySelectorAll<HTMLElement>('*')) {
      if (!element.textContent?.trim() || isClippedAway(element, root)) continue
      const { overflowX, overflowY } = getComputedStyle(element)
      const clipsX = overflowX === 'hidden' || overflowX === 'clip'
      const clipsY = overflowY === 'hidden' || overflowY === 'clip'
      if (clipsX) await expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth)
      if (clipsY) await expect(element.scrollHeight).toBeLessThanOrEqual(element.clientHeight)
    }
  } finally {
    style.remove()
  }
}

const settleTimeout = 1000

/**
 * Waits for the finite animations running now (the soft fade-in of a panel or popup) to finish,
 * so a visibility or contrast check does not read the first frame. Looping ones are skipped.
 */
export async function expectAnimationsSettled() {
  const finite = document.getAnimations().filter((animation) => {
    const { endTime, iterations } = animation.effect?.getComputedTiming() ?? {}
    return (
      animation.playState === 'running' &&
      iterations !== Number.POSITIVE_INFINITY &&
      Number.isFinite(Number(endTime))
    )
  })
  await Promise.race([
    Promise.allSettled(finite.map((animation) => animation.finished)),
    new Promise((resolve) => setTimeout(resolve, settleTimeout)),
  ])
}
