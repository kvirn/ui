import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vite-plus/test'
import { buildSearchIndex, searchEntries } from './search-index.ts'
import type { SearchEntry } from './search-index.ts'

const entry = (label: string, summary: string | undefined, body = ''): SearchEntry => ({
  href: `/components/${label.toLowerCase()}`,
  label,
  ...(summary === undefined ? {} : { summary }),
  body,
})

describe('searchEntries', () => {
  test('a word only in the body finds the page and returns an excerpt containing it', () => {
    const entries = [
      entry('Button', 'A button.', 'Sets aria-expanded on the trigger when the panel opens.'),
      entry('Badge', 'A badge.', 'Nothing relevant.'),
    ]
    const hits = searchEntries(entries, 'aria-expanded')
    expect(hits.map((hit) => hit.entry.label)).toEqual(['Button'])
    expect(hits[0]?.excerpt).toContain('aria-expanded')
  })

  test('a label match ranks before a summary match, which ranks before a body-only match', () => {
    const entries = [
      entry('Alpha', 'Nothing.', 'The placement of the popup.'),
      entry('Beta', 'Controls placement.', ''),
      entry('Placement', 'Where it goes.', ''),
    ]
    expect(searchEntries(entries, 'placement').map((hit) => hit.entry.label)).toEqual([
      'Placement',
      'Beta',
      'Alpha',
    ])
  })

  test('only a body-only match carries an excerpt', () => {
    const entries = [
      entry('Beta', 'Controls placement.', 'placement'),
      entry('Alpha', undefined, 'placement'),
    ]
    expect(searchEntries(entries, 'placement').map((hit) => hit.excerpt !== undefined)).toEqual([
      false,
      true,
    ])
  })

  test('case and diacritics are ignored', () => {
    // kv-lang-ok: Swedish text, because the test is about folding å, ä and ö
    const entries = [entry('Knapp', 'Knappen.', 'Vid återställ går fokus till fältet.')]
    // kv-lang-ok: the same Swedish text, in capitals
    expect(searchEntries(entries, 'ÅTERSTÄLL')).toHaveLength(1)
    expect(searchEntries(entries, 'aterstall')).toHaveLength(1)
  })

  test('placement does not match "replacement": a word matches at its start', () => {
    const entries = [entry('Button', 'A button.', 'Use for replacement of text.')]
    expect(searchEntries(entries, 'placement')).toEqual([])
    expect(searchEntries(entries, 'replace')).toHaveLength(1)
  })

  test('tool tip finds Tooltip', () => {
    const entries = [entry('Tooltip', 'A hint.'), entry('Toolbar', 'Tools.')]
    expect(searchEntries(entries, 'tool tip').map((hit) => hit.entry.label)).toEqual(['Tooltip'])
  })

  test('an empty or whitespace query returns no hits', () => {
    const entries = [entry('Tooltip', 'A hint.')]
    expect(searchEntries(entries, '')).toEqual([])
    expect(searchEntries(entries, '  \t ')).toEqual([])
  })
})

describe('buildSearchIndex', () => {
  const contentDirectory = join(import.meta.dirname, '../content')
  const slugs = readdirSync(contentDirectory)
    .filter((file) => file.endsWith('.api.ts'))
    .map((file) => file.replace(/\.api\.ts$/, ''))

  test('every component page with an api file gets a non-empty body', () => {
    expect(slugs.length).toBeGreaterThan(0)
    const entries = buildSearchIndex(
      slugs.map((slug) => ({ href: `/components/${slug}`, label: slug })),
    )
    expect(entries.filter((page) => page.body === '').map((page) => page.href)).toEqual([])
  })

  test('a page with neither an api file nor a contract has an empty body', () => {
    const [page] = buildSearchIndex([{ href: '/components/no-such-page', label: 'None' }])
    expect(page?.body).toBe('')
  })

  test('false finds no page by a prop default: type and default values are not indexed', () => {
    const [page] = buildSearchIndex([{ href: '/components/accordion', label: 'Accordion' }])
    expect(page?.body).toContain('hiddenUntilFound')
    expect(page?.body).not.toContain("'div' | 'ul' | 'ol'")
    expect(page?.body).not.toMatch(/hiddenUntilFound false/)
  })

  test('a prop name from an api file finds its page', () => {
    const entries = buildSearchIndex([{ href: '/components/accordion', label: 'Accordion' }])
    expect(searchEntries(entries, 'hiddenUntilFound')).toHaveLength(1)
  })
})
