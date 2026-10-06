import type { KvirnProviderProps, KvirnThemeScriptProps } from '@kvirn-ui/react'
import { Heading, Link } from '@kvirn-ui/react'
import type { ThemeOptions } from '@kvirn-ui/core'
import { propRows, PropTable } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { PageWithContents } from './page-contents.tsx'
import { LanguageAndDates } from '../examples/kvirn-provider/language-and-dates.tsx'
import { messages } from '../messages/en.ts'

const providerRows = propRows<KvirnProviderProps>({
  children: { type: 'ReactNode', default: '–', description: 'What the provider wraps.' },
  locale: {
    type: 'string (BCP 47)',
    default: "'en', or the parent's",
    description: 'Drives Intl formatting, lang and which texts are looked up.',
  },
  dir: {
    type: "'ltr' | 'rtl'",
    default: "From locale, or the parent's",
    description: 'Overrides the direction that the locale gives.',
  },
  country: {
    type: "'SE' | 'FI' | 'NO'",
    default: "The parent's, else from locale",
    description: 'The country for masks that differ by country.',
  },
  messages: {
    type: 'PartialMessages',
    default: 'Inherited, then built-in en',
    description: 'A catalog or a partial override of the texts.',
  },
  timeZone: {
    type: 'string (IANA)',
    default: "The parent's, or the runtime's zone",
    description: 'The zone dates are shown in. Set it for server rendering.',
  },
  linkComponent: {
    type: 'RegisteredLinkComponent',
    default: "'a', or the parent's",
    description: "The router's link component, rendered by every component that renders a link.",
  },
  icons: {
    type: 'IconRegistry',
    default: "The built-in icons, then the parent's",
    description: 'Icons for <Icon name>, from defineIcons. Merged by name.',
  },
  iconDefaults: {
    type: 'IconDefaults',
    default: "The parent's",
    description: 'Default size and strokeWidth for every Icon below. Merged by field.',
  },
  theme: {
    type: 'ThemeOptions',
    default: '–',
    description: 'Defaults and storage for the theme. Read by the outermost provider only.',
  },
  env: {
    type: 'Env',
    default: 'The page, after hydration',
    description: 'The window and document to use, for an iframe or a test.',
  },
})

const themeRows = propRows<ThemeOptions>({
  defaultColorScheme: {
    type: "'light' | 'dark' | 'system'",
    default: "'system'",
    description: 'The colour scheme until the user chooses.',
  },
  defaultContrast: {
    type: "'standard' | 'more' | 'system'",
    default: "'system'",
    description: 'The contrast until the user chooses.',
  },
  storage: {
    type: "'local' | 'none' | { read, write }",
    default: "'local'",
    description: 'Where a chosen preference is kept.',
  },
})

const scriptRows = propRows<KvirnThemeScriptProps>({
  nonce: { type: 'string', default: '–', description: "The response's CSP nonce." },
  defaultColorScheme: {
    type: "'light' | 'dark' | 'system'",
    default: "'system'",
    description: 'Must match the provider’s theme.defaultColorScheme.',
  },
  defaultContrast: {
    type: "'standard' | 'more' | 'system'",
    default: "'system'",
    description: 'Must match the provider’s theme.defaultContrast.',
  },
})

const hookRows = {
  useLocale: {
    type: '{ locale, dir, country, localeProps: { lang, dir } }',
    default: 'en, ltr without a provider',
    description: 'The nearest provider’s language, direction and mask country.',
  },
  useDateSettings: {
    type: '{ timeZone }',
    default: '–',
    description: 'The time zone, or undefined for the runtime’s.',
  },
  useFormat: {
    type: '{ number, date, list, plural }',
    default: 'en without a provider',
    description: 'Formats the way the locale writes. See Locales and strings.',
  },
  useTheme: {
    type: '{ colorScheme, contrast, resolvedColorScheme, resolvedContrast, isForcedColors, selectColorScheme, selectContrast }',
    default: '–',
    description: 'Reads and changes the page’s theme preference. Works without a provider.',
  },
}

const nextProviders = `// app/providers.tsx
'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <KvirnProvider
      locale="sv-SE"
      messages={sv}
      timeZone="Europe/Stockholm"
      linkComponent={NextLink}
    >
      {children}
    </KvirnProvider>
  )
}`

const nextLayout = `// app/layout.tsx
import { KvirnThemeScript } from '@kvirn-ui/react'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { Providers } from './providers'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="sv-SE" dir="ltr" suppressHydrationWarning>
      <head>
        <KvirnThemeScript nonce={nonce} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}`

const tanstack = `// src/main.tsx
import { KvirnProvider } from '@kvirn-ui/react'
import { fi } from '@kvirn-ui/i18n/fi'
import { Link, RouterProvider } from '@tanstack/react-router'

export function App() {
  return (
    <KvirnProvider locale="fi-FI" messages={fi} timeZone="Europe/Helsinki" linkComponent={Link}>
      <RouterProvider router={router} />
    </KvirnProvider>
  )
}`

const nestedSection = `function FinnishSummary({ children }: { children: ReactNode }) {
  return (
    <KvirnProvider locale="fi-FI" messages={fi}>
      <FinnishSection>{children}</FinnishSection>
    </KvirnProvider>
  )
}

function FinnishSection({ children }: { children: ReactNode }) {
  const { localeProps } = useLocale()
  return <section {...localeProps}>{children}</section>
}`

const register = `// kvirn-ui.d.ts
import type NextLink from 'next/link'
import type { icons } from './icons'

declare module '@kvirn-ui/react' {
  interface Register {
    linkComponent: typeof NextLink
    icons: typeof icons
  }
}`

const themeOptions = `<KvirnProvider theme={{ defaultColorScheme: 'system', defaultContrast: 'system', storage: 'local' }}>`

const themeSwitcher = `const theme = useTheme()

<input
  type="radio"
  name="color-scheme"
  checked={theme.colorScheme === 'dark'}
  onChange={() => theme.selectColorScheme('dark')}
/>`

const themeScript = `<KvirnThemeScript nonce={nonce} defaultColorScheme="system" defaultContrast="system" />`

const announce = `const { announce } = useAnnouncer()

announce('Your changes are saved')`

export function KvirnProviderPage({ exampleSource }: { exampleSource: string }) {
  return (
    <PageWithContents
      title="KvirnProvider"
      lead="Gives every KvirnUI component its language, text, text direction, date settings and router link. It also owns the page's theme preference and the live regions that announcements use."
      sections={[
        {
          id: 'when-to-use',
          label: 'When to use it',
          content: (
            <ul>
              <li>
                Put one KvirnProvider at the root of your app. It is optional, but it is where
                announcements come from, so every real service needs it.
              </li>
              <li>
                Without it, components use English, left-to-right text, the runtime&apos;s time
                zone, weeks that start on Monday and a plain <code>&lt;a&gt;</code>. The theme
                follows the device.
              </li>
              <li>
                Add a nested provider for a part of the page in another language. A nested provider
                inherits everything it doesn&apos;t set.
              </li>
              <li>
                Don&apos;t nest providers to change the theme or to add live regions: there is one
                theme and one pair of live regions per page.
              </li>
            </ul>
          ),
        },
        {
          id: 'example',
          label: 'Example',
          content: (
            <ExampleFrame headingId="example" code={exampleSource}>
              <LanguageAndDates />
            </ExampleFrame>
          ),
        },
        {
          id: 'set-up',
          label: 'Set up',
          content: (
            <>
              <Heading level={3} id="next-js">
                Next.js (App Router)
              </Heading>
              <p>
                <code>KvirnProvider</code> is a client component, so a component you pass as a prop,
                such as <code>NextLink</code>, needs a client wrapper.
              </p>
              <CodeBlock code={nextProviders} />
              <CodeBlock code={nextLayout} />
              <Note kind="reminder">
                Set <code>&lt;html lang dir&gt;</code> to the root provider&apos;s language and
                direction. The provider renders no element of its own, so it can&apos;t set the
                language of the page (WCAG 3.1.1). Set <code>timeZone</code> too, so the server and
                the browser show the same date.
              </Note>
              <p>
                <code>suppressHydrationWarning</code> on <code>&lt;html&gt;</code> is on purpose:{' '}
                <code>KvirnThemeScript</code> adds the theme attributes before React hydrates. It
                only affects <code>&lt;html&gt;</code>&apos;s own attributes.
              </p>
              <Heading level={3} id="tanstack-router">
                TanStack Router
              </Heading>
              <CodeBlock code={tanstack} />
              <p>
                In a client-only app the provider applies the theme when it mounts, so the default
                theme can flash for a moment. If you render on the server, add{' '}
                <code>KvirnThemeScript</code> to the document&apos;s <code>&lt;head&gt;</code>.
              </p>
            </>
          ),
        },
        {
          id: 'language-and-dates',
          label: 'Language, direction and dates',
          content: (
            <>
              <p>
                <code>locale</code> is a BCP 47 tag such as <code>sv-SE</code>, <code>fi-FI</code>{' '}
                or <code>nn-NO</code>. It drives <code>Intl</code> formatting and <code>lang</code>.
                A bare <code>en</code> is read as US English (<code>10/14/26</code>), so pass{' '}
                <code>en-GB</code> for <code>14/10/2026</code>. The direction comes from the locale,
                and the <code>dir</code> prop overrides it. For a locale you don&apos;t know ahead
                of time, <code>resolveDirection(locale)</code> from <code>@kvirn-ui/core</code>{' '}
                gives the direction.
              </p>
              <p>
                <code>country</code> is <code>SE</code>, <code>FI</code> or <code>NO</code>, for the
                masks that differ by country. It is the prop, else the region of the locale (
                <code>sv-FI</code> is <code>FI</code>), else the language (<code>sv</code> is{' '}
                <code>SE</code>, <code>fi</code> is <code>FI</code>, <code>nb</code>,{' '}
                <code>nn</code>, <code>no</code> and <code>se</code> are <code>NO</code>). For{' '}
                <code>en</code> it is undefined, and a country mask then only takes digits and warns
                once in development. Set it where the locale doesn&apos;t say, such as{' '}
                <code>se</code> in Finland.
              </p>
              <p>
                Weeks always start on Monday, with ISO 8601 week numbers, so there is no setting.
                Texts and how to change them are on{' '}
                <Link href="/foundation/locales">Locales and strings</Link>.
              </p>
              <Heading level={3} id="section-in-another-language">
                A section in another language
              </Heading>
              <p>
                A nested provider with another <code>locale</code> needs that language&apos;s
                catalog too, or its texts stay in the parent&apos;s language while <code>lang</code>{' '}
                says otherwise (a development warning names both). Because the provider renders no
                wrapper, spread <code>localeProps</code> on the element that starts the section.
              </p>
              <CodeBlock code={nestedSection} />
            </>
          ),
        },
        {
          id: 'links-and-icons',
          label: 'Router links and icons',
          content: (
            <>
              <p>
                Pass your router&apos;s link component as <code>linkComponent</code>, and every
                KvirnUI component that renders a link uses it. It must forward its ref and render an{' '}
                <code>&lt;a&gt;</code>. To get its props typed, including typed routes, register it
                once. Without the augmentation <code>linkComponent</code> only accepts{' '}
                <code>&apos;a&apos;</code>. The <code>icons</code> key is the type of the registry
                you pass to <code>icons</code>, so a misspelt <code>Icon name</code> is a type
                error. Both keys are optional.
              </p>
              <CodeBlock code={register} />
              <p>
                See <Link href="/components/icon">Icon</Link> for <code>defineIcons</code> and{' '}
                <code>iconDefaults</code>.
              </p>
            </>
          ),
        },
        {
          id: 'theme',
          label: 'Theme preference',
          content: (
            <>
              <p>
                The default theme has two independent axes: colour scheme (<code>light</code>,{' '}
                <code>dark</code>) and contrast (<code>standard</code>, <code>more</code>). Each
                follows the device (<code>system</code>) until the user chooses. The resolved values
                are written to <code>&lt;html&gt;</code> as <code>data-kv-color-scheme</code> and{' '}
                <code>data-kv-contrast</code>. Under forced colours the device&apos;s palette always
                wins. See <Link href="/foundation/theming">Theming</Link> for the CSS.
              </p>
              <CodeBlock code={themeOptions} />
              <Heading level={3} id="api-theme-options">
                Theme options
              </Heading>
              <PropTable headingId="api-theme-options" rows={themeRows} part="theme-options" />
              <Note kind="tip">
                There is one theme store per page. The outermost provider&apos;s <code>theme</code>{' '}
                configures it, and a <code>theme</code> on a nested provider is ignored with a
                development warning.
              </Note>
              <Heading level={3} id="theme-switcher">
                A theme switcher
              </Heading>
              <p>
                <code>useTheme()</code> reads and changes the preference, with or without a
                provider. Build the switcher from native radio groups with visible labels in a{' '}
                <code>fieldset</code>, one group per axis, and keep each option at least 24 × 24 CSS
                pixels. A theme change moves no focus and announces nothing, so the checked radio is
                the feedback: don&apos;t put the resolved values in a live region. When{' '}
                <code>isForcedColors</code> is true, say that the device&apos;s colours are in use
                and keep the controls working. The Display settings at the top of this site are
                built this way.
              </p>
              <CodeBlock code={themeSwitcher} />
              <Heading level={3} id="theme-storage">
                Where the choice is kept
              </Heading>
              <p>
                The preference is written only when the user selects a value, never on load, and
                only the axes that differ from your defaults. <code>&apos;local&apos;</code> stores
                JSON under the <code>localStorage</code> key <code>kvirn-ui:theme</code> (if storage
                is off or full, the choice still applies for the visit), and other tabs follow it.{' '}
                <code>&apos;none&apos;</code> keeps it in memory. Pass a{' '}
                <code>{'{ read, write }'}</code> adapter for a first-party cookie, so the server can
                render the attributes itself. The store validates what the adapter returns, and a{' '}
                <code>read</code> or <code>write</code> that throws is caught. Check with your data
                protection officer that a stored preference is strictly necessary for your service,
                and describe it in your privacy notice. The ePrivacy question is still open in
                KvirnUI (<code>TODO(legal-verify)</code>).
              </p>
              <Heading level={3} id="theme-script">
                The theme script
              </Heading>
              <p>
                <code>KvirnThemeScript</code> is a small blocking inline script that reads the
                stored preference and the device settings and sets the attributes before first
                paint, so there is no flash of the wrong theme. It takes the response&apos;s CSP{' '}
                <code>nonce</code>, so a strict <code>script-src</code> works without{' '}
                <code>&apos;unsafe-inline&apos;</code>. Render it only in the server-rendered
                document, and pass it the same defaults as the provider. It reads{' '}
                <code>localStorage</code> only, so don&apos;t render it with a custom adapter.
              </p>
              <CodeBlock code={themeScript} />
            </>
          ),
        },
        {
          id: 'announcements',
          label: 'Announcements',
          content: (
            <>
              <p>
                The outermost provider renders two empty, visually hidden live regions after its
                children, one polite and one assertive. Components and your own code reach them
                through <code>useAnnouncer().announce</code>. Nested providers use the outermost
                one&apos;s regions, so a page never has two pairs and no message is read twice. The
                regions are where a screen reader hears a change that moves no focus (WCAG 4.1.3),
                such as a result count, a rejected character or a finished upload.
              </p>
              <CodeBlock code={announce} />
              <p>
                Without a provider, <code>announce</code> does nothing and a development warning
                says so. The regions have no <code>lang</code> of their own: they inherit the
                page&apos;s, which is another reason to set <code>&lt;html lang&gt;</code>. See{' '}
                <Link href="/components/announcer">Announcer</Link> for politeness and throttling.
              </p>
              <Note kind="reminder">{messages.docs.note.announcerProvider}</Note>
            </>
          ),
        },
        {
          id: 'api',
          label: 'API reference',
          content: (
            <>
              <CodeBlock
                code={
                  "import { KvirnProvider, KvirnThemeScript, useLocale, useDateSettings, useFormat, useTheme } from '@kvirn-ui/react'"
                }
              />
              <Heading level={3} id="api-kvirn-provider">
                KvirnProvider
              </Heading>
              <p>
                Renders no element of its own, apart from the live regions of the outermost one.
              </p>
              <PropTable headingId="api-kvirn-provider" rows={providerRows} part="kvirn-provider" />
              <Heading level={3} id="api-hooks">
                Hooks
              </Heading>
              <p>
                Each hook reads the nearest provider. <code>useTheme</code> reads the one theme
                store of the page.
              </p>
              <PropTable headingId="api-hooks" rows={hookRows} part="hooks" />
              <Heading level={3} id="api-kvirn-theme-script">
                KvirnThemeScript
              </Heading>
              <PropTable
                headingId="api-kvirn-theme-script"
                rows={scriptRows}
                part="kvirn-theme-script"
              />
            </>
          ),
        },
      ]}
    />
  )
}
