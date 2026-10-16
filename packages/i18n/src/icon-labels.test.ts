import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vite-plus/test'
import { en } from './locales/en.ts'
import { fi } from './locales/fi.ts'
import { nb } from './locales/nb.ts'
import { nn } from './locales/nn.ts'
import { sv } from './locales/sv.ts'

const catalog: { icons: { name: string; label: string | null }[] } = JSON.parse(
  readFileSync(new URL('../../icons/catalog.json', import.meta.url), 'utf8'),
)
const catalogKeys = catalog.icons
  .flatMap((icon) => (icon.label === null ? [] : [icon.label.replace(/^icons\./, '')]))
  .sort()

describe('icon labels', () => {
  for (const [code, messages] of Object.entries({ sv, fi, nb, nn, en })) {
    it(`${code} has a label for every labelled icon in the catalogue and no other`, () => {
      expect(Object.keys(messages.icons).sort()).toEqual(catalogKeys)
    })
  }
})
