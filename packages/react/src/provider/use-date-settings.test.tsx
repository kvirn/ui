import type { WeekStart } from '@kvirn-ui/core'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { useDateSettings } from './use-date-settings.ts'
import { KvirnProvider } from './kvirn-provider.tsx'

// Plan 0081: the provider's `weekStart` and how `useDateSettings` resolves it.

function WeekStartProbe({ onSettings }: { onSettings: (weekStart: number) => void }) {
  onSettings(useDateSettings().weekStart)
  return null
}

async function readWeekStart(provider: { locale?: string; weekStart?: unknown }, nested?: unknown) {
  let seen = 0
  const probe = <WeekStartProbe onSettings={(weekStart) => (seen = weekStart)} />
  await render(
    <KvirnProvider locale={provider.locale} weekStart={provider.weekStart as WeekStart}>
      {nested === undefined ? (
        probe
      ) : (
        <KvirnProvider weekStart={nested as WeekStart}>{probe}</KvirnProvider>
      )}
    </KvirnProvider>,
  )
  return seen
}

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('useDateSettings().weekStart', () => {
  test('is Monday without a provider', async () => {
    let seen = 0
    await render(<WeekStartProbe onSettings={(weekStart) => (seen = weekStart)} />)
    expect(seen).toBe(1)
  })

  test('a bare en stays Monday', async () => {
    expect(await readWeekStart({ locale: 'en' })).toBe(1)
  })

  test('a locale that names a region gives its first day: en-US is Sunday, en-GB Monday', async () => {
    expect(await readWeekStart({ locale: 'en-US' })).toBe(7)
    expect(await readWeekStart({ locale: 'en-GB' })).toBe(1)
  })

  test('an explicit provider weekStart wins over the locale', async () => {
    expect(await readWeekStart({ locale: 'en-US', weekStart: 1 })).toBe(1)
    expect(await readWeekStart({ locale: 'sv-SE', weekStart: 6 })).toBe(6)
  })

  test('a nested provider inherits it, and its own value wins', async () => {
    expect(await readWeekStart({ weekStart: 6 }, undefined)).toBe(6)
    let seen = 0
    await render(
      <KvirnProvider weekStart={6}>
        <KvirnProvider>
          <WeekStartProbe onSettings={(weekStart) => (seen = weekStart)} />
        </KvirnProvider>
      </KvirnProvider>,
    )
    expect(seen).toBe(6)
    expect(await readWeekStart({ weekStart: 6 }, 7)).toBe(7)
  })

  test('an invalid weekStart is ignored with one development warning', async () => {
    expect(await readWeekStart({ locale: 'en-US', weekStart: 9 })).toBe(7)
    expect(consoleWarn).toHaveBeenCalledOnce()
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('weekStart')
  })
})

describe('useDateSettings().timeZone', () => {
  function ZoneProbe() {
    return <p>{useDateSettings().timeZone}</p>
  }

  test('is UTC without a provider or a provider time zone, never the runtime zone', async () => {
    await render(<ZoneProbe />)
    await expect.element(page.getByText('UTC')).toBeVisible()
  })

  test('is the provider time zone when it is set', async () => {
    await render(
      <KvirnProvider timeZone="Europe/Stockholm">
        <ZoneProbe />
      </KvirnProvider>,
    )
    await expect.element(page.getByText('Europe/Stockholm')).toBeVisible()
  })
})
