import { describe, expect, it, vi } from 'vite-plus/test'
import { createMessageFormat } from './create-message-format.ts'
import type { MessageFormatter } from './create-message-format.ts'
import { resolveMessageNamespace } from './resolve-messages.ts'
import type { MessageResolutionIssue } from './resolve-messages.ts'

interface SearchMessages {
  heading: string | (() => string)
  resultCount: (values: { count: number }, format: MessageFormatter) => string
}

const englishSearch: SearchMessages = {
  heading: 'Search',
  resultCount: ({ count }, format) =>
    format.plural(count, { one: '1 result', other: `${count} results` }),
}

const swedishFormat = createMessageFormat({ locale: 'sv-SE', timeZone: undefined })

function resolveSearch(overrides: readonly (Partial<SearchMessages> | undefined)[]) {
  const reportIssue = vi.fn<(issue: MessageResolutionIssue) => void>()
  const searchMessages = resolveMessageNamespace({
    namespace: 'search',
    fallback: englishSearch,
    overrides,
    format: swedishFormat,
    reportIssue,
  })
  return { searchMessages, reportIssue }
}

describe('resolveMessageNamespace: text keys', () => {
  it('uses the fallback when nothing overrides it, and reports the fallback', () => {
    const { searchMessages, reportIssue } = resolveSearch([])
    expect(searchMessages.heading).toBe('Search')
    expect(reportIssue).toHaveBeenCalledWith({
      type: 'fallback',
      namespace: 'search',
      key: 'heading',
    })
  })

  it('takes the first layer that has a value (instance, then nearest provider, then ancestors)', () => {
    const { searchMessages, reportIssue } = resolveSearch([
      undefined,
      { heading: 'Search (nearest)' },
      { heading: 'Search (root)' },
    ])
    expect(searchMessages.heading).toBe('Search (nearest)')
    expect(reportIssue).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'heading' }))
  })

  it('falls through an empty or whitespace-only override and reports it', () => {
    const { searchMessages, reportIssue } = resolveSearch([
      { heading: '  ' },
      { heading: 'Search' },
    ])
    expect(searchMessages.heading).toBe('Search')
    expect(reportIssue).toHaveBeenCalledWith({
      type: 'empty-override',
      namespace: 'search',
      key: 'heading',
    })
  })

  it('calls function values for text keys (external i18n systems) and falls through empty results', () => {
    expect(resolveSearch([{ heading: () => 'Hae' }]).searchMessages.heading).toBe('Hae')
    const { searchMessages, reportIssue } = resolveSearch([{ heading: () => '' }])
    expect(searchMessages.heading).toBe('Search')
    expect(reportIssue).toHaveBeenCalledWith({
      type: 'empty-override',
      namespace: 'search',
      key: 'heading',
    })
  })
})

describe('resolveMessageNamespace: function keys', () => {
  it('binds the locale format helper, so callers pass only the values', () => {
    const { searchMessages } = resolveSearch([
      {
        resultCount: ({ count }, format) =>
          format.plural(count, { one: 'one hit', other: `${format.number(count)} hits` }),
      },
    ])
    expect(searchMessages.resultCount({ count: 1 })).toBe('one hit')
    expect(searchMessages.resultCount({ count: 1500 })).toBe(
      `${new Intl.NumberFormat('sv-SE').format(1500)} hits`,
    )
  })

  it('calls the layers in order and returns the first non-empty result', () => {
    const nearest = vi.fn<SearchMessages['resultCount']>(() => ' ')
    const root = vi.fn<SearchMessages['resultCount']>(({ count }) => `${count} hits`)
    const { searchMessages, reportIssue } = resolveSearch([
      { resultCount: nearest },
      { resultCount: root },
    ])

    expect(searchMessages.resultCount({ count: 3 })).toBe('3 hits')
    expect(nearest).toHaveBeenCalledWith({ count: 3 }, swedishFormat)
    expect(root).toHaveBeenCalledWith({ count: 3 }, swedishFormat)
    expect(reportIssue).toHaveBeenCalledWith({
      type: 'empty-override',
      namespace: 'search',
      key: 'resultCount',
    })
  })

  it('falls back to the fallback function and reports it', () => {
    const { searchMessages, reportIssue } = resolveSearch([])
    expect(searchMessages.resultCount({ count: 2 })).toBe('2 results')
    expect(reportIssue).toHaveBeenCalledWith({
      type: 'fallback',
      namespace: 'search',
      key: 'resultCount',
    })
  })
})
