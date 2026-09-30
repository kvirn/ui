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

/**
 * Runs axe with the WCAG 2.2 AA tags on `element` and throws a readable report if
 * anything fails. There is deliberately no way to disable rules (AGENTS.md, hard rule 1).
 */
export async function expectNoA11yViolations(element: Element): Promise<void> {
  const axeResults = await axe.run(element, {
    runOnly: { type: 'tag', values: [...wcagTags] },
    resultTypes: ['violations'],
  })
  if (axeResults.violations.length > 0) {
    throw new Error(
      `Expected no accessibility violations, found ${axeResults.violations.length}:\n${formatViolations(axeResults.violations)}`,
    )
  }
}
