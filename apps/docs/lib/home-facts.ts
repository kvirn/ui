import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The number of runtime dependencies in core's `package.json`, read at build time so the fact on
 * the landing page can't drift. Server components only. Next runs from `apps/docs`.
 */
export function countCoreDependencies() {
  const file = join(process.cwd(), '..', '..', 'packages', 'core', 'package.json')
  const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'))
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'dependencies' in parsed &&
    typeof parsed.dependencies === 'object' &&
    parsed.dependencies !== null
  ) {
    return Object.keys(parsed.dependencies).length
  }
  return 0
}
