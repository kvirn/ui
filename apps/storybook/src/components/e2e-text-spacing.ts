import type { Page } from '@playwright/test'

/**
 * WCAG 1.4.12 Text Spacing, as the criterion states it: with the user's overrides applied
 * (`.kv-story-text-spacing` in `.storybook/preview.css`: line height 1.5, letter spacing 0.12em,
 * word spacing 0.16em and 2em after paragraphs), no content is clipped or lost. It asserts the
 * outcome, never a CSS value (AGENTS.md rule 13).
 *
 * Returns what is wrong, so an empty list passes:
 * - the page scrolls sideways (the text no longer fits its column),
 * - a block with text overflows its own height (a line is cut off),
 * - a text input's value is wider than its box (the answer is cut off).
 *
 * Checkboxes and radios hold no text, so only their labels are measured. The visually hidden
 * "Fel:" prefix is skipped.
 */
export async function textSpacingProblems(page: Page): Promise<string[]> {
  await page.evaluate(() => {
    document.body.classList.add('kv-story-text-spacing')
  })
  return page.evaluate(() => {
    const found: string[] = []
    const root = document.documentElement
    if (root.scrollWidth > root.clientWidth) {
      found.push(`page scrolls sideways: ${root.scrollWidth} > ${root.clientWidth}`)
    }
    const scope = document.querySelector('#storybook-root') ?? document.body
    for (const element of scope.querySelectorAll<HTMLElement>('*')) {
      if (element.closest('.kv-field-error-prefix') !== null || element.tagName === 'FIELDSET') {
        continue
      }
      const style = getComputedStyle(element)
      if (style.display === 'inline' || style.display === 'contents' || style.display === 'none') {
        continue
      }
      const name = `${element.tagName.toLowerCase()}${[...element.classList].map((className) => `.${className}`).join('')}`
      if (element instanceof HTMLInputElement) {
        if (
          element.type !== 'checkbox' &&
          element.type !== 'radio' &&
          element.scrollWidth > element.clientWidth
        ) {
          found.push(`${name} cuts off its value`)
        }
      } else if (
        (element.textContent ?? '').trim() !== '' &&
        element.clientHeight > 1 &&
        element.scrollHeight > element.clientHeight + 1
      ) {
        found.push(`${name} overflows its height`)
      }
    }
    return found
  })
}
