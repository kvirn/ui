import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { Calendar } from '../calendar/calendar.tsx'
import { KvirnProvider } from './kvirn-provider.tsx'
import { ProviderFixture } from './kvirn-provider.fixture.tsx'
import { hydrate, serverRender } from './kvirn-provider-ssr.fixture.tsx'

// Its own file: hydration connects the document theme store, which every test here shares.

let hydrated: (ReturnType<typeof hydrate> & { container: HTMLElement }) | undefined

afterEach(() => {
  hydrated?.root.unmount()
  hydrated?.consoleError.mockRestore()
  hydrated?.container.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test('an instant with timeZone reads the same on the server and after hydration', async () => {
  const app = (
    <KvirnProvider locale="sv-SE" messages={sv} timeZone="Europe/Stockholm">
      <ProviderFixture />
    </KvirnProvider>
  )
  const container = serverRender(app)
  hydrated = { container, ...hydrate(container, app) }
  const serverText = hydrated.container.querySelector('time')?.textContent
  expect(serverText).toContain('08:30')

  await expect.element(page.getByText('Europe/Stockholm')).toBeVisible()
  expect(hydrated.container.querySelector('time')?.textContent).toBe(serverText)
  expect(hydrated.recoverableErrors).toEqual([])
  expect(hydrated.consoleError).not.toHaveBeenCalled()
})

test('a nested fi-FI section server-renders and hydrates in Finnish without errors', async () => {
  const app = (
    <KvirnProvider locale="sv-SE" messages={sv} timeZone="Europe/Stockholm">
      <KvirnProvider locale="fi-FI" messages={fi}>
        <ProviderFixture />
      </KvirnProvider>
    </KvirnProvider>
  )
  const container = serverRender(app)
  hydrated = { container, ...hydrate(container, app) }
  expect(hydrated.container.textContent).toContain('Asetukset')

  await expect.element(page.getByRole('heading', { name: 'Asetukset' })).toBeVisible()
  expect(hydrated.container.querySelector('section')?.getAttribute('lang')).toBe('fi-FI')
  expect(hydrated.container.querySelector('time')?.textContent).toContain('lokakuuta')
  expect(hydrated.recoverableErrors).toEqual([])
  expect(hydrated.consoleError).not.toHaveBeenCalled()
})

test('Calendar without a timeZone hydrates on the UTC date, then follows the browser zone', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'))
  const app = (
    <KvirnProvider locale="sv-SE" messages={sv}>
      <Calendar.Root>
        <Calendar.Grid />
      </Calendar.Root>
    </KvirnProvider>
  )
  const container = serverRender(app)
  expect(container.querySelector('[aria-current="date"]')?.textContent).toBe('14')

  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
    timeZone: 'Pacific/Auckland',
  } as Intl.ResolvedDateTimeFormatOptions)
  hydrated = { container, ...hydrate(container, app) }
  await vi.waitFor(() => {
    expect(hydrated?.container.querySelector('[aria-current="date"]')?.textContent).toBe('15')
  })
  expect(hydrated.recoverableErrors).toEqual([])
  expect(
    hydrated.consoleError.mock.calls.filter(([message]) => String(message).includes('ydrat')),
  ).toEqual([])
})

test('Calendar with DOM focus in the grid keeps its focus, Tab stop and arrow targets when "today" switches', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'))
  const app = (
    <KvirnProvider locale="sv-SE" messages={sv}>
      <Calendar.Root>
        <Calendar.Heading />
        <Calendar.Grid />
      </Calendar.Root>
    </KvirnProvider>
  )
  const container = serverRender(app)
  const focusedCell = container.querySelector<HTMLElement>('[aria-current="date"]')
  focusedCell?.focus()
  expect(document.activeElement).toBe(focusedCell)

  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
    timeZone: 'Pacific/Auckland',
  } as Intl.ResolvedDateTimeFormatOptions)
  hydrated = { container, ...hydrate(container, app) }
  await vi.waitFor(() => {
    expect(hydrated?.container.querySelector('[aria-current="date"]')?.textContent).toBe('15')
  })
  const cellByText = (text: string) =>
    [...hydrated!.container.querySelectorAll<HTMLElement>('[role="gridcell"]')].find(
      (cell) => cell.textContent === text,
    )
  expect(document.activeElement).toBe(cellByText('14'))
  expect(cellByText('14')?.getAttribute('tabindex')).toBe('0')
  expect(cellByText('15')?.getAttribute('tabindex')).toBe('-1')

  await userEvent.keyboard('{ArrowRight}')
  expect(document.activeElement).toBe(cellByText('15'))
  expect(hydrated.container.querySelector('h3')?.textContent).toContain('oktober 2026')
  expect(hydrated.recoverableErrors).toEqual([])
})

test('a chosen date and defaultFocusedDate keep the Tab stop when "today" switches', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'))
  const app = (
    <KvirnProvider locale="sv-SE" messages={sv}>
      <Calendar.Root defaultValue="2026-10-20">
        <Calendar.Grid />
      </Calendar.Root>
      <Calendar.Root defaultFocusedDate="2026-10-22">
        <Calendar.Grid />
      </Calendar.Root>
    </KvirnProvider>
  )
  const container = serverRender(app)
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
    timeZone: 'Pacific/Auckland',
  } as Intl.ResolvedDateTimeFormatOptions)
  hydrated = { container, ...hydrate(container, app) }
  await vi.waitFor(() => {
    expect(hydrated?.container.querySelectorAll('[aria-current="date"]')[0]?.textContent).toBe('15')
  })
  const stops = [...hydrated.container.querySelectorAll<HTMLElement>('[tabindex="0"]')]
  expect(stops.map((cell) => cell.textContent)).toEqual(['20', '22'])
})
