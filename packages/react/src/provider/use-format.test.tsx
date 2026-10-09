import { fi } from '@kvirn-ui/i18n/fi'
import { useEffect } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { useFormat } from '../index.ts'
import type { UseFormatResult } from '../index.ts'
import { KvirnProvider } from './kvirn-provider.tsx'

// Plan 0046. The expected texts come from `Intl` directly, so they don't depend on the code under test.

const lateEveningUtc = Date.UTC(2026, 0, 23, 23, 30)

function FormatProbe({ onFormat }: { onFormat?: (format: UseFormatResult) => void }) {
  const format = useFormat()
  useEffect(() => {
    onFormat?.(format)
  })
  return (
    <dl>
      <dt>Number</dt>
      <dd>{format.number(1250.5, { minimumFractionDigits: 2 })}</dd>
      <dt>Instant</dt>
      <dd>{format.date(lateEveningUtc, { dateStyle: 'long', timeStyle: 'short' })}</dd>
      <dt>Calendar date</dt>
      <dd>{format.date('2026-01-23', { dateStyle: 'long' })}</dd>
    </dl>
  )
}

/** What the probe shows for a locale: the instant in the zone, the calendar date on its own day. */
function expectedTexts(locale: string, timeZone: string | undefined) {
  return [
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(1250.5),
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
      ...(timeZone === undefined ? {} : { timeZone }),
    }).format(lateEveningUtc),
    new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
      Date.UTC(2026, 0, 23),
    ),
  ]
}

async function readTexts(): Promise<(string | null)[]> {
  const definitions = page.getByRole('definition')
  await expect.element(definitions.first()).toBeVisible()
  return definitions.elements().map((element) => element.textContent)
}

describe('useFormat', () => {
  beforeEach(resetDevWarnings)

  test('without a provider it formats in en and UTC, not the runtime time zone', async () => {
    await render(<FormatProbe />)
    const [number, instant, calendarDate] = expectedTexts('en', 'UTC')
    expect(await readTexts()).toEqual([number, `${instant} UTC`, calendarDate])
  })

  test('an instant shown in the UTC fallback names the zone, so the time is never silently wrong', async () => {
    function TimeFields() {
      const format = useFormat()
      return (
        <>
          <p>{format.date(lateEveningUtc, { hour: 'numeric', minute: 'numeric' })}</p>
          <p>{format.date(lateEveningUtc, { timeStyle: 'long' })}</p>
          <p>{format.date(lateEveningUtc, { dateStyle: 'long' })}</p>
        </>
      )
    }
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await render(<TimeFields />)
    const paragraphs = page.getByRole('paragraph')
    await expect.element(paragraphs.first()).toBeVisible()
    const texts = paragraphs.elements().map((element) => element.textContent ?? '')
    consoleWarn.mockRestore()
    expect(texts[0]).toContain('UTC')
    expect(texts[1]).toContain('UTC')
    expect(texts[2]).not.toContain('UTC')
  })

  test.each(['sv-SE', 'fi-FI', 'en'])(
    'the zone text after a short time comes from Intl for %s, not a literal',
    async (locale) => {
      function Short() {
        const format = useFormat()
        return <p>{format.date(lateEveningUtc, { timeStyle: 'short' })}</p>
      }
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await render(
        <KvirnProvider locale={locale}>
          <Short />
        </KvirnProvider>,
      )
      const paragraph = page.getByRole('paragraph')
      await expect.element(paragraph).toBeVisible()
      const text = paragraph.element().textContent ?? ''
      consoleWarn.mockRestore()
      const zoneName = new Intl.DateTimeFormat(locale, {
        timeZone: 'UTC',
        timeZoneName: 'short',
        hour: 'numeric',
      })
        .formatToParts(lateEveningUtc)
        .find((part) => part.type === 'timeZoneName')?.value
      expect(zoneName).toBeDefined()
      expect(text.endsWith(` ${zoneName}`)).toBe(true)
    },
  )

  test('formatting an instant without a time zone warns once, naming the fix', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await render(
      <KvirnProvider locale="sv-SE">
        <FormatProbe />
        <FormatProbe />
      </KvirnProvider>,
    )
    await readTexts()
    const warnings = consoleWarn.mock.calls.filter(([message]) =>
      String(message).includes('timeZone'),
    )
    consoleWarn.mockRestore()
    expect(warnings).toHaveLength(1)
    expect(String(warnings[0]?.[0])).toContain('Pass `timeZone` on <KvirnProvider>')
  })

  test('a calendar date, a time zone on the provider or one in the options never warns', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    function CalendarDateOnly() {
      const format = useFormat()
      return <p>{format.date('2026-01-23')}</p>
    }
    function ExplicitZone() {
      const format = useFormat()
      return <p>{format.date(lateEveningUtc, { timeZone: 'Europe/Stockholm' })}</p>
    }
    await render(
      <>
        <KvirnProvider>
          <CalendarDateOnly />
          <ExplicitZone />
        </KvirnProvider>
        <KvirnProvider timeZone="Europe/Stockholm">
          <FormatProbe />
        </KvirnProvider>
      </>,
    )
    await readTexts()
    const warnings = consoleWarn.mock.calls.length
    consoleWarn.mockRestore()
    expect(warnings).toBe(0)
  })

  test('follows the provider locale and time zone, and a calendar date keeps its day', async () => {
    // Honolulu is west of UTC: the instant moves to the afternoon, the calendar date must not move.
    await render(
      <KvirnProvider locale="sv-SE" timeZone="Pacific/Honolulu">
        <FormatProbe />
      </KvirnProvider>,
    )
    const texts = await readTexts()
    expect(texts).toEqual(expectedTexts('sv-SE', 'Pacific/Honolulu'))
    expect(texts[2]).toBe('23 januari 2026')
  })

  test('a nested provider formats its section in its own locale', async () => {
    await render(
      <KvirnProvider locale="sv-SE" timeZone="Europe/Stockholm">
        <KvirnProvider locale="fi-FI" messages={fi}>
          <FormatProbe />
        </KvirnProvider>
      </KvirnProvider>,
    )
    expect(await readTexts()).toEqual(expectedTexts('fi-FI', 'Europe/Stockholm'))
  })

  test('is the same object until the locale or the time zone changes', async () => {
    const seen = new Set<UseFormatResult>()
    const onFormat = (format: UseFormatResult) => {
      seen.add(format)
    }
    const example = (locale: string, timeZone: string) => (
      <KvirnProvider locale={locale} timeZone={timeZone}>
        <FormatProbe onFormat={onFormat} />
      </KvirnProvider>
    )
    const view = await render(example('sv-SE', 'UTC'))
    await view.rerender(example('sv-SE', 'UTC'))
    expect(seen.size).toBe(1)
    await view.rerender(example('sv-SE', 'Europe/Stockholm'))
    expect(seen.size).toBe(2)
    await view.rerender(example('fi-FI', 'Europe/Stockholm'))
    expect(seen.size).toBe(3)
  })
})
