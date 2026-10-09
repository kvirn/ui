import {
  Heading,
  Link,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRoot,
  TableRow,
  TableRowHeader,
  TableScrollRegion,
} from '@kvirn-ui/react'
import { CodeBlock } from './code-block.tsx'
import { Note } from './note.tsx'
import { PageWithContents } from './page-contents.tsx'

const whereRows = [
  {
    entry: '@kvirn-ui/react',
    runs: "Client (a 'use client' entry). Server-rendered to HTML, then hydrated.",
    server:
      'Render parts and components by their flat names (AlertTitle, TabsList). Do not call hooks.',
  },
  {
    entry: '@kvirn-ui/react/server',
    runs: "Server. No 'use client' and no client JavaScript.",
    server: 'Yes: KvirnThemeScript, getLocaleProps, getMessages, createMessageFormat.',
  },
  {
    entry: '@kvirn-ui/core',
    runs: 'Anywhere. No React, and no window or document when it is imported.',
    server: 'Yes.',
  },
  {
    entry: '@kvirn-ui/i18n/<locale>',
    runs: 'Anywhere. A catalog is an object of functions.',
    server: 'Import it, but do not pass it as a prop to a client component.',
  },
  {
    entry: '@kvirn-ui/theme',
    runs: 'CSS only.',
    server: 'Yes: import theme.css in the layout.',
  },
]

const serverComponent = `// A Server Component: no 'use client', no hooks
import { AlertInfo, AlertTitle } from '@kvirn-ui/react'

export function Notice() {
  return (
    <AlertInfo>
      <AlertTitle as="h3">The service is slower than usual today</AlertTitle>
    </AlertInfo>
  )
}`

const asRules = `<AlertTitle as="p">Saved</AlertTitle>   // a tag string: fine
<LinkRoot as={MyClientLink} href="/a" />   // a client reference: fine
<LinkRoot as={MyServerComponent} />   // a server component or an inline function: throws
<LinkRoot as={<a />} />   // an element: not accepted`

const clientFile = `'use client'
import { useLocale, useTheme } from '@kvirn-ui/react'

export function ThemeLabel() {
  const { locale } = useLocale()
  const { colorScheme } = useTheme()
  return <p lang={locale}>{colorScheme}</p>
}`

const nextProviders = `// app/kvirn-provider.tsx
'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import type { KvirnProviderProps } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import NextLink from 'next/link'
import { icons } from './icons' // a 'use client' module that calls defineIcons

export function AppKvirnProvider(
  props: Omit<KvirnProviderProps, 'messages' | 'linkComponent' | 'icons' | 'env'>,
) {
  return <KvirnProvider {...props} messages={sv} linkComponent={NextLink} icons={icons} />
}`

const nextLayout = `// app/layout.tsx (a Server Component)
import { KvirnThemeScript, getLocaleProps } from '@kvirn-ui/react/server'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { AppKvirnProvider } from './kvirn-provider'
import { theme } from './theme'

const locale = 'sv-SE'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const { lang, dir } = getLocaleProps(locale)

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <KvirnThemeScript nonce={nonce} theme={theme} />
      </head>
      <body>
        <AppKvirnProvider locale={locale} timeZone="Europe/Stockholm" weekStart={1} theme={theme}>
          {children}
        </AppKvirnProvider>
      </body>
    </html>
  )
}`

const themeFile = `// app/theme.ts: one object for the script and the provider
export const theme = {
  defaultColorScheme: 'system',
  defaultContrast: 'system',
  defaultMotion: 'system',
} as const`

const serverStrings = `import { getMessages, createMessageFormat } from '@kvirn-ui/react/server'
import { sv } from '@kvirn-ui/i18n/sv'

const texts = getMessages('alert', { locale: 'sv-SE', messages: sv, timeZone: 'Europe/Stockholm' })
const format = createMessageFormat({ locale: 'sv-SE', timeZone: 'Europe/Stockholm' })`

const cookieAttributes = `<html lang={lang} dir={dir} data-kv-color-scheme="dark">`

const proxyFile = `// proxy.ts (middleware.ts before Next 16)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const policy = [
    "default-src 'self'",
    \`script-src 'self' 'nonce-\${nonce}' 'strict-dynamic'\`,
    "style-src 'self' 'unsafe-inline'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', policy)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', policy)
  return response
}

// Skip static assets and prefetches: they need no nonce
export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [{ type: 'header', key: 'next-router-prefetch' }],
    },
  ],
}`

const plainSsr = `import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { KvirnProvider } from '@kvirn-ui/react'

const app = (
  <KvirnProvider locale="sv-SE" timeZone="Europe/Stockholm">
    <App />
  </KvirnProvider>
)

// on the server
const html = renderToString(app)

// in the browser, on the markup the server sent
hydrateRoot(document.getElementById('root'), app)`

export function RenderingPage() {
  return (
    <PageWithContents
      title="Rendering: server and client"
      lead="What runs on the server, what runs in the browser, and how to set up the Provider so the two agree. The examples are for Next.js App Router, which is what this site runs."
      sections={[
        {
          id: 'where-code-runs',
          label: 'Where code runs',
          content: (
            <>
              <p>
                The whole <code>@kvirn-ui/react</code> entry is a client entry. The server entry is
                a separate import path.
              </p>
              <TableScrollRegion aria-labelledby="where-code-runs">
                <TableRoot aria-labelledby="where-code-runs">
                  <TableHead>
                    <TableRow>
                      <TableColumnHeader>Entry</TableColumnHeader>
                      <TableColumnHeader>Runs where</TableColumnHeader>
                      <TableColumnHeader>From a Server Component</TableColumnHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {whereRows.map((row) => (
                      <TableRow key={row.entry}>
                        <TableRowHeader>
                          <code>{row.entry}</code>
                        </TableRowHeader>
                        <TableCell>{row.runs}</TableCell>
                        <TableCell>{row.server}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </TableScrollRegion>
            </>
          ),
        },
        {
          id: 'server-components',
          label: 'Server Components',
          content: (
            <>
              <p>
                Every export of <code>@kvirn-ui/react</code> is a client reference when a Server
                Component imports it. You can render it. It is server-rendered to HTML like any
                other component, and it hydrates in the browser. The pages of this site are Server
                Components that render Heading, Link and Table this way.
              </p>
              <Heading as="h3" id="flat-exports">
                Use the flat exports
              </Heading>
              <p>
                A Server Component can&apos;t read a property of a client reference, so{' '}
                <code>Alert.Title</code> fails there. Import the flat name instead:{' '}
                <code>AlertTitle</code>, <code>TabsList</code>, <code>FieldRoot</code>. It is the
                same component. Examples in these docs use the dotted form, which works in a client
                file.
              </p>
              <CodeBlock code={serverComponent} />
              <Heading as="h3" id="crosses-the-boundary">
                What crosses the boundary
              </Heading>
              <p>
                Props from a Server Component to a client component are serialised. Strings,
                numbers, plain objects and <code>children</code> cross. Functions do not, so an{' '}
                <code>onClick</code> belongs in a client file. A hook can only be called in a client
                file, so <code>useButton()</code>, <code>useTheme()</code> and the others are not
                available in a Server Component. Build that markup from the part components instead.
              </p>
              <Heading as="h3" id="as-in-server-components">
                The as prop
              </Heading>
              <p>
                There is no <code>render</code> prop. A part&apos;s element is the <code>as</code>{' '}
                prop. It takes a tag string, or a component that is a client reference. It never
                takes an element or an inline function: the types do not accept an element, and a
                server component or an inline function throws.
              </p>
              <CodeBlock code={asRules} />
              <p>
                <code>next/link</code> is a plain server wrapper on the server, not a client
                reference. Import it in a <code>&apos;use client&apos;</code> module, and use it as{' '}
                <code>as</code> or as the Provider&apos;s <code>linkComponent</code> from there.
              </p>
              <Heading as="h3" id="server-strings">
                Texts and formats in a Server Component
              </Heading>
              <p>
                <code>@kvirn-ui/react/server</code> has the server versions of what the hooks give.
                <code>getMessages</code> is <code>useMessages</code> for one namespace.{' '}
                <code>createMessageFormat</code> is the formatter behind <code>useFormat</code>.
              </p>
              <CodeBlock code={serverStrings} />
            </>
          ),
        },
        {
          id: 'client-components',
          label: 'Client Components and hooks',
          content: (
            <>
              <p>
                Hooks and anything with state or an event handler go in a file that starts with{' '}
                <code>&apos;use client&apos;</code>. The Provider&apos;s hooks (
                <code>useLocale</code>, <code>useDateSettings</code>, <code>useFormat</code>,{' '}
                <code>useTheme</code>) read the nearest provider, so they work in that file.
              </p>
              <CodeBlock code={clientFile} />
              <p>
                Without a provider the hooks use English, left-to-right text and UTC, and{' '}
                <code>useTheme</code> still works. See the{' '}
                <Link href="/foundation/kvirn-provider">KvirnProvider</Link> page for what each hook
                returns.
              </p>
            </>
          ),
        },
        {
          id: 'provider-in-next',
          label: 'The Provider in a Next.js app',
          content: (
            <>
              <p>
                <code>KvirnProvider</code> is a client component and the layout is a Server
                Component. Props that are strings, numbers or plain objects pass from the layout.
                Catalogs, <code>linkComponent</code>, <code>icons</code>, a custom{' '}
                <code>theme.storage</code> and <code>env</code> do not, so put those in one small
                client wrapper. The{' '}
                <Link href="/foundation/kvirn-provider#next-js">KvirnProvider page</Link> has the
                full list and why.
              </p>
              <CodeBlock code={nextProviders} />
              <CodeBlock code={themeFile} />
              <CodeBlock code={nextLayout} />
              <p>
                <code>getLocaleProps</code> sets <code>lang</code> and <code>dir</code> on{' '}
                <code>&lt;html&gt;</code>, because the provider renders no element of its own and
                can&apos;t set the page language (WCAG 3.1.1). <code>suppressHydrationWarning</code>{' '}
                on <code>&lt;html&gt;</code> is on purpose, see the next section.
              </p>
            </>
          ),
        },
        {
          id: 'first-paint',
          label: 'No flash of the wrong theme',
          content: (
            <>
              <p>
                The theme preference lives in <code>localStorage</code> (or in memory with{' '}
                <code>storage: &apos;none&apos;</code>). The server can&apos;t read it. Two things
                cover the first paint.
              </p>
              <ul>
                <li>
                  The theme&apos;s CSS follows the device through <code>prefers-color-scheme</code>,{' '}
                  <code>prefers-contrast</code> and <code>prefers-reduced-motion</code> until an
                  attribute says otherwise.
                </li>
                <li>
                  <code>KvirnThemeScript</code> is a small blocking inline script in{' '}
                  <code>&lt;head&gt;</code>. It reads the stored choice and sets{' '}
                  <code>data-kv-color-scheme</code>, <code>data-kv-contrast</code> and{' '}
                  <code>data-kv-motion</code> on <code>&lt;html&gt;</code> before the first paint.
                </li>
              </ul>
              <p>
                That is why the server markup and the page differ on purpose, and why the layout has{' '}
                <code>suppressHydrationWarning</code>. It only affects the attributes of{' '}
                <code>&lt;html&gt;</code> itself. Pass the script the same <code>theme</code> object
                as the provider. It reads <code>localStorage</code> only, so don&apos;t render it
                with a custom storage adapter.
              </p>
              <p>
                Render the script only in the server-rendered document: React never runs a script it
                creates in the browser, and warns in development if it does. In an app that renders
                only in the browser, the provider applies the theme when it mounts, so the default
                theme can show for a moment.
              </p>
              <p>
                If you keep the choice in your own cookie, the server can write the attribute
                itself, with no script. Write one only for an explicit choice, and leave it out for{' '}
                <code>system</code>. The recipe is in the repo&apos;s KvirnProvider guide (
                <code>kvirn-provider.md</code>, Cookie storage adapter recipe).
              </p>
              <CodeBlock code={cookieAttributes} />
            </>
          ),
        },
        {
          id: 'time-zones',
          label: 'Time zones and dates',
          content: (
            <>
              <p>
                The server and the browser can be in different time zones. Set <code>timeZone</code>{' '}
                on the provider, the same on both, and an instant reads the same in the server HTML
                and after hydration. Without one, instants are shown in UTC, never the
                runtime&apos;s zone, so the two renders still agree. The first instant shown without
                a zone logs a warning in development. A date-only instant then carries no zone label
                and can show the neighbouring day: for a calendar date use the{' '}
                <code>YYYY-MM-DD</code> string. A Calendar&apos;s &ldquo;today&rdquo; is the UTC
                date on first paint and the browser&apos;s date after mount.
              </p>
              <p>
                Set <code>weekStart</code> explicitly for the same reason: a runtime without{' '}
                <code>Intl</code> week data can answer Monday where another answers Sunday. A date
                written <code>YYYY-MM-DD</code> is a calendar date and is shown on that day in every
                zone. See <Link href="/foundation/locales">Locales and strings</Link> for
                formatting.
              </p>
            </>
          ),
        },
        {
          id: 'strict-csp',
          label: 'Strict CSP',
          content: (
            <>
              <p>
                A strict <code>script-src</code> without <code>&apos;unsafe-inline&apos;</code>{' '}
                needs a nonce on the inline theme script. Make the nonce in <code>proxy.ts</code>,
                send it on as <code>x-nonce</code>, and read it in the layout as above.
              </p>
              <CodeBlock code={proxyFile} />
              <Note kind="reminder">
                Reading <code>headers()</code> makes every page dynamic, because a nonce is made per
                request and a static page can&apos;t carry one. This site turns the nonce on only
                when it is built with <code>DOCS_CSP_NONCE=1</code>, so its default build stays
                static. With it on, the script runs and hydration reports no mismatch.
              </Note>
            </>
          ),
        },
        {
          id: 'other-frameworks',
          label: 'Other frameworks and plain SSR',
          content: (
            <>
              <p>
                The repo checks Next.js App Router in this site, and checks server rendering with{' '}
                <code>renderToString</code> and then <code>hydrateRoot</code> in its tests. That
                covers the provider, a time zone, a nested section in another language, the theme
                script under a nonce-only CSP and <code>useTheme</code> without a provider. The
                tests report no hydration error. Other frameworks are not tested here.
              </p>
              <CodeBlock code={plainSsr} />
              <ul>
                <li>
                  During server rendering there is no window or document, so <code>env</code> is
                  undefined and the provider gives its defaults. It uses the page&apos;s own window
                  and document after hydration. Set <code>env</code> only for an iframe or a test.
                </li>
                <li>
                  Render <code>KvirnThemeScript</code> in the document&apos;s head if you render on
                  the server, with the response&apos;s nonce.
                </li>
                <li>
                  Set <code>lang</code> and <code>dir</code> on <code>&lt;html&gt;</code> yourself
                  with <code>getLocaleProps</code>.
                </li>
              </ul>
            </>
          ),
        },
      ]}
    />
  )
}
