import { describe, expect, it } from 'vite-plus/test'
import { compareCatalogs } from './catalog-shape.ts'

const reference = {
  link: { newTabNotice: '(opens in a new tab)' },
  search: { resultCount: (values: { count: number }) => `${values.count} results` },
}

describe('compareCatalogs', () => {
  it('accepts a catalog with the same shape', () => {
    const swedish = {
      link: { newTabNotice: '(öppnas i en ny flik)' },
      search: { resultCount: (values: { count: number }) => `${values.count} träffar` },
    }
    expect(compareCatalogs('en', reference, 'sv', swedish)).toEqual([])
  })

  it('reports missing, empty, mismatched and unexpected keys', () => {
    const broken = {
      link: { newTabNotice: '  ' },
      search: { resultCount: 'träffar' },
      extra: { key: 'x' },
    }
    expect(compareCatalogs('en', reference, 'sv', broken)).toEqual([
      'sv: "link.newTabNotice" is empty',
      'sv: "search.resultCount" is string, but en has function(1)',
      'sv: unexpected "extra.key" (not in en)',
    ])
    expect(compareCatalogs('en', reference, 'fi', {})).toEqual([
      'fi: missing "link.newTabNotice"',
      'fi: missing "search.resultCount"',
    ])
  })
})
