import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The text of an example file, for the code shown under a live example, so the code shown is
 * the code that runs. Server components only: it reads at build time. Next runs from
 * `apps/docs`, so the path is relative to it. The text starts with a line that names the file.
 */
export function readExampleSource(file: string) {
  // The docs site needs `'use client'` to import a hook example into a Server Component page; the
  // library is framework agnostic, so the reader's copy leaves the directive out.
  const source = readFileSync(join(process.cwd(), 'examples', file), 'utf8')
    .replace(/^(['"])use client\1;?\n+/, '')
    .trimEnd()
  // The file's name is the first line, as a sample names its file: the code panel's header shows
  // it and the copy leaves it out (code-block.tsx).
  return `// ${file}\n${source}`
}
