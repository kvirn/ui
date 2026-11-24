import axe from 'axe-core'
import type { Result } from 'axe-core'
import { wcagTags } from './wcag-tags.ts'

export function formatViolations(violations: readonly Result[]): string {
  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => `    - ${node.target.join(' ')}`).join('\n')
      return `  [${violation.id}] ${violation.help} (${violation.impact ?? 'unknown'})\n    ${violation.helpUrl}\n${targets}`
    })
    .join('\n')
}

const optionTextClass = 'kv-listbox-option-text'

const isNamedByOwnOptionText = (element: Element | undefined) => {
  if (element?.getAttribute('role') !== 'option') return false
  const ids = element.getAttribute('aria-labelledby')?.split(/\s+/).filter(Boolean) ?? []
  return (
    ids.length > 0 &&
    ids.every((id) => {
      const target = element.ownerDocument.getElementById(id)
      return (
        target !== null && element.contains(target) && target.classList.contains(optionTextClass)
      )
    })
  )
}

/**
 * Runs axe with the WCAG 2.2 AA tags on `element` and throws a readable report if
 * anything fails. No rule can be disabled (AGENTS.md, hard rule 1), and nothing is configurable
 * from outside. The one exception is `label-content-name-mismatch` on a rich listbox option named
 * by its own `.kv-listbox-option-text`: under Understanding 2.5.3 that text is the label and the
 * second line is a description, but axe takes all visible text as the label. The maintainer
 * approved it on 2026-11-24.
 */
export async function expectNoA11yViolations(element: Element): Promise<void> {
  const axeResults = await axe.run(element, {
    runOnly: { type: 'tag', values: [...wcagTags] },
    resultTypes: ['violations'],
    elementRef: true,
  })
  const violations = axeResults.violations
    .map((violation) =>
      violation.id === 'label-content-name-mismatch'
        ? {
            ...violation,
            nodes: violation.nodes.filter((node) => !isNamedByOwnOptionText(node.element)),
          }
        : violation,
    )
    .filter((violation) => violation.nodes.length > 0)
  if (violations.length > 0) {
    throw new Error(
      `Expected no accessibility violations, found ${violations.length}:\n${formatViolations(violations)}`,
    )
  }
}
