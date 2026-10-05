import { fi } from '@kvirn-ui/i18n/fi'
import { useEffect } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
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
  test('without a provider it formats in en and the runtime time zone', async () => {
    await render(<FormatProbe />)
    expect(await readTexts()).toEqual(expectedTexts('en', undefined))
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
