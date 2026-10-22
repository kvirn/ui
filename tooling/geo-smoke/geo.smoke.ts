import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import { kvirnGeocoder } from '../../packages/map/src/kvirn.ts'

const serviceUrl = 'https://geo.kvirn.com'
const timeout = 15_000
const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const skippedDirectories = new Set(['node_modules', '.next'])

async function readHealthCountries() {
  const response = await fetch(`${serviceUrl}/health`)
  expect(response.status).toBe(200)
  const { sources } = (await response.json()) as { sources: { countries: string[] }[] }
  return [...new Set(sources.flatMap((source) => source.countries))]
}

function* sourceFiles(directory: string): Generator<string> {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (skippedDirectories.has(entry.name)) {
      continue
    }
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      yield* sourceFiles(path)
    } else if (/\.tsx?$/.test(entry.name)) {
      yield path
    }
  }
}

describe('geo.kvirn.com smoke', () => {
  it(
    'health answers 200 with a sources list that names its countries',
    async () => {
      const response = await fetch(`${serviceUrl}/health`)
      expect(response.status).toBe(200)
      const { sources } = (await response.json()) as { sources: unknown }
      expect(Array.isArray(sources)).toBe(true)
      for (const source of sources as { countries: unknown }[]) {
        expect(Array.isArray(source.countries)).toBe(true)
        expect((source.countries as unknown[]).every((code) => typeof code === 'string')).toBe(true)
      }
    },
    timeout,
  )

  it(
    'every country in a kvirnGeocoder config under apps is one the service serves',
    async () => {
      const served = await readHealthCountries()
      const configPattern = /kvirnGeocoder\(\{[\s\S]*?\}\)/g
      let configCount = 0
      const problems: string[] = []
      for (const file of sourceFiles(join(repoRoot, 'apps'))) {
        for (const [config] of readFileSync(file, 'utf8').matchAll(configPattern)) {
          configCount += 1
          const list = /countries:\s*\[([^\]]*)\]/.exec(config)?.[1]
          for (const [, code] of (list ?? '').matchAll(/['"]([^'"]+)['"]/g)) {
            if (!served.includes(code!.toLowerCase())) {
              problems.push(
                `${relative(repoRoot, file)}: "${code}" is not served (${served.join(', ')})`,
              )
            }
          }
        }
      }
      expect(configCount, 'no kvirnGeocoder config found under apps').toBeGreaterThan(0)
      expect(problems).toEqual([])
    },
    timeout,
  )

  it(
    'autocomplete search through kvirnGeocoder resolves to a list',
    async () => {
      const geocoder = kvirnGeocoder({ url: serviceUrl, countries: await readHealthCountries() })
      const results = await geocoder.search('Drottninggatan 1', { intent: 'suggest', locale: 'en' })
      expect(Array.isArray(results)).toBe(true)
    },
    timeout,
  )

  it(
    'submit search through kvirnGeocoder resolves to a list',
    async () => {
      const geocoder = kvirnGeocoder({ url: serviceUrl, countries: await readHealthCountries() })
      const results = await geocoder.search('Drottninggatan 1 Stockholm', {
        intent: 'submit',
        locale: 'en',
      })
      expect(Array.isArray(results)).toBe(true)
    },
    timeout,
  )

  it(
    'structured lookup through kvirnGeocoder resolves to a result or null',
    async () => {
      const countries = await readHealthCountries()
      const geocoder = kvirnGeocoder({ url: serviceUrl, countries })
      const result = await geocoder.structured!(
        { street: 'Drottninggatan', number: '1', city: 'Stockholm', country: countries[0]! },
        { signal: AbortSignal.timeout(timeout), locale: 'en' },
      )
      expect(result === null || typeof result.label === 'string').toBe(true)
    },
    timeout,
  )

  it(
    'reverse answers 200 with a labelled result',
    async () => {
      const response = await fetch(
        `${serviceUrl}/v1/geocode/reverse?lon=18.0686&lat=59.3293&radius=2000`,
      )
      expect(response.status).toBe(200)
      const { result } = (await response.json()) as { result: { label: unknown } }
      expect(typeof result.label).toBe('string')
    },
    timeout,
  )
})
