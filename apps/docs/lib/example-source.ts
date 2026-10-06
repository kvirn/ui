import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The text of an example file, for the code shown under a live example, so the code shown is
 * the code that runs. Server components only: it reads at build time. Next runs from
 * `apps/docs`, so the path is relative to it.
 */
export function readExampleSource(file: string) {
  return readFileSync(join(process.cwd(), 'examples', file), 'utf8').trimEnd()
}
