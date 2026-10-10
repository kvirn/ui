import { createThemeStore } from '@kvirn-ui/core'
import type { PartialMessages } from '@kvirn-ui/i18n'
import { sv } from '@kvirn-ui/i18n/sv'
import { renderToString } from 'react-dom/server'
import { expect, test } from 'vite-plus/test'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { KvirnThemeScript as ClientThemeScript } from '../provider/kvirn-theme-script.tsx'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'
import * as server from '../server.ts'

const theme = {
  defaultColorScheme: 'dark',
  defaultContrast: 'more',
  defaultMotion: 'reduce',
} as const

function Probe({ read }: { read: () => unknown }) {
  return <output>{JSON.stringify(read())}</output>
}

function readFromProvider(read: () => unknown, locale: string, messages?: PartialMessages) {
  const markup = renderToString(
    <KvirnProvider locale={locale} messages={messages} timeZone="UTC">
      <Probe read={read} />
    </KvirnProvider>,
  )
  const text = new DOMParser()
    .parseFromString(markup, 'text/html')
    .querySelector('output')?.textContent
  return JSON.parse(text ?? 'null')
}

test('the server KvirnThemeScript renders the same script as the client one for the same theme', () => {
  const serverMarkup = renderToString(<server.KvirnThemeScript nonce="abc" theme={theme} />)
  const clientMarkup = renderToString(<ClientThemeScript nonce="abc" theme={theme} />)
  expect(serverMarkup).toBe(clientMarkup)
  expect(serverMarkup).toContain('<script')
})

test('the server KvirnThemeScript without a theme renders the same script as the client one', () => {
  expect(renderToString(<server.KvirnThemeScript />)).toBe(renderToString(<ClientThemeScript />))
})

test.each(['sv-SE', 'en', 'ar', 'he-IL', 'fa'])(
  'getLocaleProps lang and dir equal the provider for %s',
  (locale) => {
    expect(server.getLocaleProps(locale)).toEqual(
      readFromProvider(() => useLocale().localeProps, locale),
    )
  },
)

test('the server entry re-exports createMessageFormat', () => {
  expect(server.createMessageFormat).toBeTypeOf('function')
  expect(createThemeStore).toBeTypeOf('function')
})

test('getMessages equals useMessages for a text key and a parameterised key', () => {
  const values = { page: 1234, total: 5678 }
  const fromProvider = readFromProvider(
    () => {
      const messages = useMessages('pagination')
      return { next: messages.next, status: messages.status(values) }
    },
    'sv-SE',
    sv,
  )
  const fromServer = server.getMessages('pagination', {
    locale: 'sv-SE',
    messages: sv,
    timeZone: 'UTC',
  })
  expect({ next: fromServer.next, status: fromServer.status(values) }).toEqual(fromProvider)
  expect(fromServer.next).toBe(sv.pagination?.next)
})

test('getMessages falls back to built-in English for a missing catalog or key', () => {
  expect(server.getMessages('pagination').next).toBe('Next page')
  expect(
    server.getMessages('pagination', { messages: { pagination: { next: 'Nästa' } } }).label,
  ).toBe('Pages')
})
