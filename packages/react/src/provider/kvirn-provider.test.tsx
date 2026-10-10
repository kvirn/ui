import { getDefaultEnv } from '@kvirn-ui/core'
import type { Env } from '@kvirn-ui/core'
import { defineMessages } from '@kvirn-ui/i18n'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createElement, Profiler, useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from './kvirn-provider.tsx'
import { fixtureDate, ProviderFixture, ThemeSwitcherFixture } from './kvirn-provider.fixture.tsx'
import { useEnv } from './use-env.ts'
import { useLinkComponent } from './use-link-component.ts'
import { useLocale } from './use-locale.ts'
import { useMessages } from './use-messages.ts'

async function readSettings(regionName: string) {
  const region = page.getByRole('region', { name: regionName })
  await expect.element(region).toBeVisible()
  const [locale, direction, timeZone, date, newTabNotice] = region
    .getByRole('definition')
    .elements()
    .map((element) => element.textContent)
  return {
    locale,
    direction,
    timeZone,
    date,
    newTabNotice,
    lang: region.element().getAttribute('lang'),
    dir: region.element().getAttribute('dir'),
  }
}

function NoticeProbe({ messages }: { messages?: Partial<KvirnMessages['link']> }) {
  const linkMessages = useMessages('link', messages)
  return <p>{linkMessages.newTabNotice}</p>
}

function LinkProbe({ href, label }: { href: string; label: string }) {
  return createElement(useLinkComponent(), { href }, label)
}

function EnvProbe({ onEnv }: { onEnv: (env: Env | undefined) => void }) {
  const env = useEnv()
  useEffect(() => {
    onEnv(env)
  })
  return null
}

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  localStorage.clear()
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('without a provider', () => {
  test('uses en, ltr, UTC and the en messages', async () => {
    const { container } = await render(<ProviderFixture />)
    expect(await readSettings('Settings')).toEqual({
      locale: 'en',
      direction: 'ltr',
      timeZone: 'UTC',
      date:
        new Intl.DateTimeFormat('en', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'UTC',
        }).format(fixtureDate) + ' UTC',
      newTabNotice: '(opens in a new tab)',
      lang: 'en',
      dir: 'ltr',
    })
    // The fixture formats an instant, and there is no provider to give it a zone.
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('no `timeZone` is set')

    await expectNoA11yViolations(container)
  })

  test('uses a native <a> as the link component', async () => {
    await render(<LinkProbe href="#start" label="Start" />)
    await expect
      .element(page.getByRole('link', { name: 'Start' }))
      .toHaveAttribute('href', '#start')
  })

  test('resolves the env from the page after mount', async () => {
    let seenEnv: Env | undefined
    await render(
      <EnvProbe
        onEnv={(env) => {
          seenEnv = env
        }}
      />,
    )
    expect(seenEnv?.document).toBe(document)
    expect(seenEnv?.window).toBe(window)
  })
})

describe('locale, direction and dates', () => {
  test('sv-SE with the sv catalog', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv} timeZone="Europe/Stockholm">
        <ProviderFixture />
      </KvirnProvider>,
    )
    expect(await readSettings('Inställningar')).toMatchObject({
      locale: 'sv-SE',
      direction: 'ltr',
      timeZone: 'Europe/Stockholm',
      newTabNotice: '(öppnas i en ny flik)',
      lang: 'sv-SE',
      dir: 'ltr',
    })
    expect(consoleWarn).not.toHaveBeenCalled()
    await expectNoA11yViolations(container)
  })

  test('formats dates in the provider time zone', async () => {
    await render(
      <KvirnProvider locale="fi-FI" messages={fi} timeZone="Europe/Helsinki">
        <ProviderFixture />
      </KvirnProvider>,
    )
    const settings = await readSettings('Asetukset')
    expect(settings.date).toBe(
      new Intl.DateTimeFormat('fi-FI', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Europe/Helsinki',
      }).format(fixtureDate),
    )
  })

  test('dir comes from the locale', async () => {
    function DirectionProbe() {
      const locale = useLocale()
      return <p {...locale.localeProps}>{`${locale.locale} ${locale.dir}`}</p>
    }
    await render(
      <KvirnProvider locale="ar-EG">
        <DirectionProbe />
      </KvirnProvider>,
    )
    const paragraph = page.getByText('ar-EG rtl')
    await expect.element(paragraph).toHaveAttribute('dir', 'rtl')
    await expect.element(paragraph).toHaveAttribute('lang', 'ar-EG')
  })

  test('the dir prop overrides the locale direction', async () => {
    await render(
      <KvirnProvider locale="en" dir="rtl">
        <ProviderFixture />
      </KvirnProvider>,
    )
    expect(await readSettings('Settings')).toMatchObject({ direction: 'rtl', dir: 'rtl' })
  })
})

describe('nesting', () => {
  test('a nested provider inherits unset props and changes only its section', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv} timeZone="Europe/Stockholm">
        <ProviderFixture />
        <KvirnProvider locale="fi-FI" messages={fi}>
          <ProviderFixture />
        </KvirnProvider>
      </KvirnProvider>,
    )
    expect(await readSettings('Inställningar')).toMatchObject({
      locale: 'sv-SE',
      newTabNotice: '(öppnas i en ny flik)',
      lang: 'sv-SE',
    })
    expect(await readSettings('Asetukset')).toMatchObject({
      locale: 'fi-FI',
      timeZone: 'Europe/Stockholm',
      newTabNotice: '(avautuu uuteen välilehteen)',
      lang: 'fi-FI',
      dir: 'ltr',
    })
    await expectNoA11yViolations(container)
  })

  test('a nested locale recomputes dir, and a nested provider without locale keeps the parent dir', async () => {
    function DirectionProbe({ label }: { label: string }) {
      const locale = useLocale()
      return <p>{`${label}: ${locale.locale} ${locale.dir}`}</p>
    }
    await render(
      <KvirnProvider locale="en" dir="rtl">
        <KvirnProvider timeZone="UTC">
          <DirectionProbe label="inherited" />
        </KvirnProvider>
        <KvirnProvider locale="sv-SE">
          <DirectionProbe label="own locale" />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('inherited: en rtl')).toBeVisible()
    await expect.element(page.getByText('own locale: sv-SE ltr')).toBeVisible()
  })

  test('a nested provider that changes language without messages warns, since its strings stay in the parent language (3.1.2)', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider locale="fi-FI">
          <NoticeProbe />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('(öppnas i en ny flik)')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toMatch(/fi-FI.*sv-SE.*messages/s)
  })

  test('a nested provider does not warn when it keeps the language or passes messages', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider locale="sv-FI">
          <NoticeProbe />
        </KvirnProvider>
        <KvirnProvider locale="fi-FI" messages={fi}>
          <NoticeProbe />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('(avautuu uuteen välilehteen)')).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a nested provider inherits the link component and env', async () => {
    const env = { window, document }
    let seenEnv: Env | undefined
    await render(
      <KvirnProvider linkComponent="a" env={env}>
        <KvirnProvider locale="sv-SE">
          <LinkProbe href="#hjalp" label="Hjälp" />
          <EnvProbe
            onEnv={(nestedEnv) => {
              seenEnv = nestedEnv
            }}
          />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('link', { name: 'Hjälp' })).toBeVisible()
    expect(seenEnv).toBe(env)
  })
})

describe('message resolution', () => {
  test('instance messages win over every provider', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <NoticeProbe messages={{ newTabNotice: '(instans)' }} />
      </KvirnProvider>,
    )
    await expect.element(page.getByText('(instans)')).toBeVisible()
  })

  test('the nearest provider wins over its ancestors, and only for its section', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <NoticeProbe />
        <KvirnProvider messages={{ link: { newTabNotice: '(extern tjänst, ny flik)' } }}>
          <NoticeProbe />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('(öppnas i en ny flik)')).toBeVisible()
    await expect.element(page.getByText('(extern tjänst, ny flik)')).toBeVisible()
  })

  test('an ancestor provider fills keys the nearest one leaves unset', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider messages={{}}>
          <NoticeProbe />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('(öppnas i en ny flik)')).toBeVisible()
  })

  test('falls back to built-in en and warns once per key under a non-en locale', async () => {
    await render(
      <KvirnProvider locale="fi-FI">
        <NoticeProbe />
        <NoticeProbe />
      </KvirnProvider>,
    )
    await expect.element(page.getByText('(opens in a new tab)').first()).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('link.newTabNotice')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('fi-FI')
  })

  test('an empty override falls through to the next level and warns once', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider messages={{ link: { newTabNotice: '   ' } }}>
          <NoticeProbe />
          <NoticeProbe messages={{ newTabNotice: '' }} />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('(öppnas i en ny flik)').first()).toBeVisible()
    expect(page.getByText('(öppnas i en ny flik)').elements()).toHaveLength(2)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('empty')
  })

  test('function values plug in an external i18n system and follow new messages', async () => {
    const translations = { sv: 'från appens i18n', en: 'from the app i18n' }
    const renderWith = (language: 'sv' | 'en') => (
      <KvirnProvider
        locale="sv-SE"
        messages={defineMessages(sv, { link: { newTabNotice: () => translations[language] } })}
      >
        <NoticeProbe />
      </KvirnProvider>
    )
    const screen = await render(renderWith('sv'))
    await expect.element(page.getByText('från appens i18n')).toBeVisible()
    await screen.rerender(renderWith('en'))
    await expect.element(page.getByText('from the app i18n')).toBeVisible()
  })
})

describe('performance', () => {
  test('a theme change re-renders theme consumers only', async () => {
    const localeCommits: string[] = []
    function LocaleOnly() {
      const locale = useLocale()
      return <p>{locale.locale}</p>
    }
    await render(
      <KvirnProvider locale="sv-SE" messages={sv} env={{ window, document: createDocument() }}>
        <Profiler id="locale-only" onRender={(id) => localeCommits.push(id)}>
          <LocaleOnly />
        </Profiler>
        <ThemeSwitcherFixture />
      </KvirnProvider>,
    )
    const commitsAfterMount = localeCommits.length
    await page.getByRole('radio', { name: 'Mörkt' }).click()
    await expect.element(page.getByText('Används nu: Mörkt', { exact: false })).toBeVisible()
    expect(localeCommits.length).toBe(commitsAfterMount)
  })
})

describe('country for the masks (Plan 0039)', () => {
  function CountryProbe({ label }: { label: string }) {
    const { country } = useLocale()
    return <p>{`${label}: ${country ?? 'none'}`}</p>
  }

  test('useLocale().country is the region of the locale, then its language, else undefined', async () => {
    await render(
      <>
        <KvirnProvider locale="sv-FI" messages={sv}>
          <CountryProbe label="sv-FI" />
        </KvirnProvider>
        <KvirnProvider locale="sv" messages={sv}>
          <CountryProbe label="sv" />
        </KvirnProvider>
        <KvirnProvider locale="nb" messages={sv}>
          <CountryProbe label="nb" />
        </KvirnProvider>
        <KvirnProvider locale="en">
          <CountryProbe label="en" />
        </KvirnProvider>
        <CountryProbe label="no provider" />
      </>,
    )
    await expect.element(page.getByText('sv-FI: FI')).toBeVisible()
    await expect.element(page.getByText('sv: SE')).toBeVisible()
    await expect.element(page.getByText('nb: NO')).toBeVisible()
    await expect.element(page.getByText('en: none')).toBeVisible()
    await expect.element(page.getByText('no provider: none')).toBeVisible()
  })

  test('the country prop wins over the locale, and a nested provider inherits it', async () => {
    await render(
      <KvirnProvider locale="nb" country="FI" messages={sv}>
        <CountryProbe label="own" />
        <KvirnProvider>
          <CountryProbe label="nested" />
        </KvirnProvider>
        <KvirnProvider country="SE">
          <CountryProbe label="nested override" />
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('own: FI')).toBeVisible()
    await expect.element(page.getByText('nested: FI')).toBeVisible()
    await expect.element(page.getByText('nested override: SE')).toBeVisible()
  })
})

function createDocument(): Document {
  return document.implementation.createHTMLDocument('')
}

test('getDefaultEnv is the page env in the browser', () => {
  expect(getDefaultEnv()?.document).toBe(document)
})
