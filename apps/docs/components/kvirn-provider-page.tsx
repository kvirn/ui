import type { KvirnProviderProps, KvirnThemeScriptProps } from '@kvirn-ui/react'
import { Link } from '@kvirn-ui/react'
import type { ThemeOptions } from '@kvirn-ui/core'
import { propRows, PropTable } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { Note } from './note.tsx'
import { AnchoredHeading } from './anchored-heading.tsx'
import { PageWithContents } from './page-contents.tsx'
import type { PageSection } from './page-contents.tsx'
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
    default: "The parent's, or UTC",
    description: 'The zone dates are shown in. Set it for server rendering.',
  },
  weekStart: {
    type: '1 to 7 (ISO weekday, 1 is Monday)',
    default: "The parent's, else the locale's when it names a region (en-US is 7), else 1",
    description:
      'The first day of the week in Calendar and DatePicker. Set it explicitly for server rendering.',
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
    description: 'Default size for every Icon below. Merged by field.',
  },
  theme: {
    type: 'ThemeOptions',
    default: '–',
    description: 'Defaults and storage for the theme. Read by the outermost provider only.',
  },
  toast: {
    type: '{ limit?: number; autoDismiss?: false | number }',
    default: '{ limit: 10, autoDismiss: false }',
    description:
      'Options for the toast region the provider renders. Read by the first provider that mounts; a later one’s is ignored. See Toasts.',
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
  defaultMotion: {
    type: "'full' | 'reduce' | 'system'",
    default: "'system'",
    description:
      'The motion until the user chooses. reduce stops every transition and animation in the theme.',
  },
  storage: {
    type: "'local' | 'none' | { read, write }",
    default: "'local'",
    description: 'Where a chosen preference is kept.',
  },
})

const scriptRows = propRows<KvirnThemeScriptProps>({
  nonce: { type: 'string', default: '–', description: "The response's CSP nonce." },
  theme: {
    type: '{ defaultColorScheme, defaultContrast, defaultMotion }',
    default: "'system' for each",
    description: 'The same object as the provider’s theme, so the defaults are written once.',
  },
})

const hookRows = {
  useLocale: {
    type: '{ locale, dir, country, localeProps: { lang, dir } }',
    default: 'en, ltr without a provider',
    description: 'The nearest provider’s language, direction and mask country.',
  },
  useDateSettings: {
    type: '{ timeZone, weekStart }',
    default: '–',
    description: 'The time zone, or undefined for UTC.',
  },
  useFormat: {
    type: '{ number, date, list, plural }',
    default: 'en without a provider',
    description: 'Formats the way the locale writes. See Locales and strings.',
  },
  useTheme: {
    type: '{ colorScheme, contrast, motion, resolvedColorScheme, resolvedContrast, resolvedMotion, isForcedColors, selectColorScheme, selectContrast, selectMotion }',
    default: '–',
    description: 'Reads and changes the page’s theme preference. Works without a provider.',
  },
}

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

const nextTheme = `// app/theme.ts: one object for the script and the provider
export const theme = {
  defaultColorScheme: 'system',
  defaultContrast: 'system',
  defaultMotion: 'system',
} as const`

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

const toastOptions = `<KvirnProvider toast={{ limit: 10, autoDismiss: false }}>`

const announce = `const { announce } = useAnnouncer()

announce('Your changes are saved')`

const nextJs = { id: 'next-js', label: 'Next.js (App Router)' }
const tanstackRouter = { id: 'tanstack-router', label: 'TanStack Router' }
const languageAndDirection = { id: 'language-and-direction', label: 'Language and direction' }
const country = { id: 'country', label: 'Country' }
const timeZoneAndWeekStart = { id: 'time-zone-and-week-start', label: 'Time zone and week start' }
const otherLanguage = { id: 'section-in-another-language', label: 'A section in another language' }
const routerLinks = { id: 'router-links', label: 'Router links' }
const icons = { id: 'icons', label: 'Icons' }
const typedRegistration = { id: 'typed-registration', label: 'Typed registration' }
const themeOptions = { id: 'theme-options', label: 'Theme options' }
const themeSwitcher = { id: 'theme-switcher', label: 'A theme switcher' }
const themeStorage = { id: 'theme-storage', label: 'Where the choice is kept' }
const themeScript = { id: 'theme-script', label: 'The theme script' }
const liveRegions = { id: 'live-regions', label: 'Announcements' }
const toasts = { id: 'toasts', label: 'Toasts' }
const imports = { id: 'imports', label: 'Imports' }
const apiProvider = { id: 'api-kvirn-provider', label: 'KvirnProvider' }
const apiHooks = { id: 'api-hooks', label: 'Hooks' }
const apiThemeScript = { id: 'api-kvirn-theme-script', label: 'KvirnThemeScript' }

const sectionLinks: Record<string, readonly PageSection[]> = {
  setUp: [nextJs, tanstackRouter],
  languageAndDates: [languageAndDirection, country, timeZoneAndWeekStart, otherLanguage],
  linksAndIcons: [routerLinks, icons, typedRegistration],
  theme: [themeOptions, themeSwitcher, themeStorage, themeScript],
  announcements: [liveRegions, toasts],
  api: [imports, apiProvider, apiHooks, apiThemeScript],
}

/** `level` 3 is listed in the contents, an `h4` is not. */
function Sub({ id, label, level = 3 }: PageSection & { level?: 3 | 4 }) {
  return (
    <AnchoredHeading as={level === 3 ? 'h3' : 'h4'} id={id}>
      {label}
    </AnchoredHeading>
  )
}

const themeOptionsCode = `<KvirnProvider theme={{ defaultColorScheme: 'system', defaultContrast: 'system', defaultMotion: 'system', storage: 'local' }}>`

const themeSwitcherCode = `const theme = useTheme()

<input
  type="radio"
  name="color-scheme"
  checked={theme.colorScheme === 'dark'}
  onChange={() => theme.selectColorScheme('dark')}
/>`

const themeScriptCode = `<KvirnThemeScript nonce={nonce} theme={theme} />`

export function KvirnProviderPage() {
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
                Without it, components use English, left-to-right text, UTC as the time zone, weeks
                that start on Monday and a plain <code>&lt;a&gt;</code>. The theme follows the
                device.
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
          id: 'set-up',
          label: 'Set up',
          children: sectionLinks.setUp,
          content: (
            <>
              <Sub {...nextJs} />
              <p>
                <code>layout.tsx</code> is a Server Component and <code>KvirnProvider</code> is a
                client component, so props cross as serialised data. Some can be passed straight
                from the layout, and some need a small client file.
              </p>
              <Sub id="next-js-from-layout" label="Passed from the layout" level={4} />
              <p>Strings, numbers and plain objects:</p>
              <ul>
                <li>
                  <code>locale</code>, <code>dir</code>, <code>country</code>, <code>timeZone</code>
                  , <code>weekStart</code>
                </li>
                <li>
                  the <code>theme</code> defaults, <code>toast</code>, <code>iconDefaults</code>
                </li>
                <li>
                  <code>children</code> and the script&apos;s <code>nonce</code>
                </li>
              </ul>
              <Sub id="next-js-client-file" label="Needs a client file" level={4} />
              <ul>
                <li>
                  <code>messages</code>: catalogs hold functions, which can&apos;t be serialised.
                </li>
                <li>
                  <code>linkComponent</code>: <code>next/link</code> is a plain server wrapper on
                  the server, not a client reference, so import it in a client module.
                </li>
                <li>
                  <code>icons</code>: components made by <code>defineIcons</code>, which comes from
                  the client entry.
                </li>
                <li>
                  <code>theme.storage</code>: an adapter is an object of functions.
                </li>
                <li>
                  <code>env</code>: a window and a document.
                </li>
              </ul>
              <Sub id="next-js-wrapper" label="The client wrapper" level={4} />
              <p>
                Put those props in one <code>&apos;use client&apos;</code> wrapper, and let the
                layout pass the rest.
              </p>
              <CodeBlock code={nextProviders} />
              <Sub id="next-js-theme" label="The theme object" level={4} />
              <p>One object for the script and the provider, so the defaults are written once.</p>
              <CodeBlock code={nextTheme} />
              <Sub id="next-js-layout" label="The layout" level={4} />
              <p>
                The layout imports <code>KvirnThemeScript</code> and <code>getLocaleProps</code>{' '}
                from <code>@kvirn-ui/react/server</code>, the entry that is safe in a Server
                Component. See{' '}
                <Link href="/foundation/rendering">Rendering: server and client</Link> for what runs
                where, the <code>as</code> rules and strict CSP.
              </p>
              <CodeBlock code={nextLayout} />
              <ul>
                <li>
                  <code>getLocaleProps(locale)</code> gives <code>lang</code> and <code>dir</code>{' '}
                  for <code>&lt;html&gt;</code>, the pair the provider derives for the same locale.
                  The provider renders no element of its own, so it can&apos;t set the language of
                  the page (WCAG 3.1.1).
                </li>
                <li>
                  Set <code>timeZone</code> and <code>weekStart</code>, so the server and the
                  browser show the same date. See{' '}
                  <a href={`#${timeZoneAndWeekStart.id}`}>{timeZoneAndWeekStart.label}</a>.
                </li>
                <li>
                  <code>suppressHydrationWarning</code> on <code>&lt;html&gt;</code> is on purpose:{' '}
                  <code>KvirnThemeScript</code> adds <code>data-kv-color-scheme</code>,{' '}
                  <code>data-kv-contrast</code> and <code>data-kv-motion</code> before React
                  hydrates. It only affects <code>&lt;html&gt;</code>&apos;s own attributes.
                </li>
              </ul>
              <Sub {...tanstackRouter} />
              <CodeBlock code={tanstack} />
              <p>
                In a client-only app the provider applies the theme when it mounts, so the default
                theme can flash for a moment. If you render on the server, render{' '}
                <code>KvirnThemeScript</code> in the document&apos;s <code>&lt;head&gt;</code>.
                Other frameworks are covered in{' '}
                <Link href="/foundation/rendering#other-frameworks">Rendering</Link>.
              </p>
            </>
          ),
        },
        {
          id: 'language-and-dates',
          label: 'Language, direction and dates',
          children: sectionLinks.languageAndDates,
          content: (
            <>
              <Sub {...languageAndDirection} />
              <p>
                <code>locale</code> is a BCP 47 tag such as <code>sv-SE</code>, <code>fi-FI</code>{' '}
                or <code>nn-NO</code>. It drives <code>Intl</code> formatting, <code>lang</code> and
                which texts are looked up. Texts and how to change them are on{' '}
                <Link href="/foundation/locales">Locales and strings</Link>.
              </p>
              <p>
                A bare <code>en</code> is read as US English (<code>10/14/26</code>), so pass{' '}
                <code>en-GB</code> for <code>14/10/2026</code>.
              </p>
              <p>
                The direction comes from the locale, and the <code>dir</code> prop overrides it. For
                a locale you don&apos;t know ahead of time, <code>resolveDirection(locale)</code>{' '}
                from <code>@kvirn-ui/core</code> gives the direction.
              </p>
              <Sub {...country} />
              <p>
                <code>country</code> is <code>SE</code>, <code>FI</code> or <code>NO</code>, for the
                masks that differ by country. The first of these that applies is used:
              </p>
              <ol>
                <li>
                  The <code>country</code> prop.
                </li>
                <li>
                  The region of the locale (<code>sv-FI</code> is <code>FI</code>).
                </li>
                <li>
                  The language: <code>sv</code> is <code>SE</code>, <code>fi</code> is{' '}
                  <code>FI</code>, and <code>nb</code>, <code>nn</code> and <code>no</code> are{' '}
                  <code>NO</code>.
                </li>
              </ol>
              <p>
                For <code>en</code> it is undefined, and a country mask then only takes digits and
                warns once in development. Set it where the locale doesn&apos;t say.
              </p>
              <Sub {...timeZoneAndWeekStart} />
              <Sub id="time-zone" label="Time zone" level={4} />
              <p>
                <code>timeZone</code> is an IANA name such as <code>Europe/Stockholm</code>. Set it
                for server rendering, so the server and the browser show the same date. Without one,
                instants are shown in UTC and the first one warns in development. A date-only
                instant then has no zone label and can show the neighbouring day; for a calendar
                date use the <code>YYYY-MM-DD</code> string.
              </p>
              <Sub id="week-start" label="Week start" level={4} />
              <p>
                <code>weekStart</code> sets the first day of the week in Calendar and DatePicker,
                from 1 (Monday) to 7 (Sunday). The first of these that applies is used:
              </p>
              <ol>
                <li>The Calendar&apos;s own value.</li>
                <li>The provider&apos;s.</li>
                <li>
                  The locale&apos;s, when it names a region (<code>en-US</code> is Sunday).
                </li>
                <li>
                  Monday: a bare <code>en</code> stays Monday.
                </li>
              </ol>
              <p>
                Week numbers are ISO 8601 and only show with a Monday start. Set{' '}
                <code>weekStart</code> explicitly for server rendering.
              </p>
              <Sub {...otherLanguage} />
              <p>
                A nested provider with another <code>locale</code> needs that language&apos;s
                catalog too, or its texts stay in the parent&apos;s language while <code>lang</code>{' '}
                says otherwise (a development warning names both).
              </p>
              <p>
                Because the provider renders no wrapper, spread <code>localeProps</code> on the
                element that starts the section.
              </p>
              <CodeBlock code={nestedSection} />
            </>
          ),
        },
        {
          id: 'links-and-icons',
          label: 'Router links and icons',
          children: sectionLinks.linksAndIcons,
          content: (
            <>
              <Sub {...routerLinks} />
              <p>
                Pass your router&apos;s link component as <code>linkComponent</code>, and every
                KvirnUI component that renders a link uses it. It must forward its ref and render an{' '}
                <code>&lt;a&gt;</code>. The <a href="#next-js-wrapper">Next.js</a> and{' '}
                <a href={`#${tanstackRouter.id}`}>TanStack Router</a> examples show it.
              </p>
              <Sub {...icons} />
              <p>
                Pass a registry made by <code>defineIcons</code> as <code>icons</code>, and set a a
                default size with <code>iconDefaults</code>. A nested provider merges the registry
                by name and the default by field. See <Link href="/components/icon">Icon</Link>.
              </p>
              <Sub {...typedRegistration} />
              <p>
                Register both once to get their props typed, including typed routes. Without the
                augmentation <code>linkComponent</code> only accepts <code>&apos;a&apos;</code>. The{' '}
                <code>icons</code> key is the type of the registry you pass to <code>icons</code>,
                so a misspelt <code>Icon name</code> is a type error. Both keys are optional.
              </p>
              <CodeBlock code={register} />
            </>
          ),
        },
        {
          id: 'theme',
          label: 'Theme preference',
          children: sectionLinks.theme,
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
              <Sub {...themeOptions} />
              <CodeBlock code={themeOptionsCode} />
              <PropTable headingId={themeOptions.id} rows={themeRows} part="theme-options" />
              <Note kind="tip">
                There is one theme store per page. The outermost provider&apos;s <code>theme</code>{' '}
                configures it, and a <code>theme</code> on a nested provider is ignored with a
                development warning.
              </Note>
              <Sub {...themeSwitcher} />
              <p>
                <code>useTheme()</code> reads and changes the preference, with or without a
                provider. The Display settings at the top of this site are built this way.
              </p>
              <ul>
                <li>
                  Build the switcher from native radio groups with visible labels in a{' '}
                  <code>fieldset</code>, one group per axis.
                </li>
                <li>Keep each option at least 24 × 24 CSS pixels.</li>
                <li>
                  A theme change moves no focus and announces nothing, so the checked radio is the
                  feedback: don&apos;t put the resolved values in a live region.
                </li>
                <li>
                  When <code>isForcedColors</code> is true, say that the device&apos;s colours are
                  in use and keep the controls working.
                </li>
              </ul>
              <CodeBlock code={themeSwitcherCode} />
              <Sub {...themeStorage} />
              <ul>
                <li>
                  The preference is written only when the user selects a value, never on load, and
                  only the axes that differ from your defaults.
                </li>
                <li>
                  <code>&apos;local&apos;</code> stores JSON under the <code>localStorage</code> key{' '}
                  <code>kvirn-ui:theme</code>, and other tabs follow it. If storage is off or full,
                  the choice still applies for the visit.
                </li>
                <li>
                  <code>&apos;none&apos;</code> keeps it in memory.
                </li>
                <li>
                  A <code>{'{ read, write }'}</code> adapter keeps it somewhere else. The store
                  validates what the adapter returns, and a <code>read</code> or <code>write</code>{' '}
                  that throws is caught.
                </li>
              </ul>
              <p>
                Check with your data protection officer that a stored preference is strictly
                necessary for your service, and describe it in your privacy notice. The ePrivacy
                question is still open in KvirnUI (<code>TODO(legal-verify)</code>).
              </p>
              <Sub {...themeScript} />
              <p>
                <code>KvirnThemeScript</code> is a small blocking inline script that reads the
                stored preference and the device settings and sets the attributes before first
                paint, so there is no flash of the wrong theme. See{' '}
                <Link href="/foundation/rendering#first-paint">No flash of the wrong theme</Link>.
              </p>
              <ul>
                <li>
                  It takes the response&apos;s CSP <code>nonce</code>, so a strict{' '}
                  <code>script-src</code> works without <code>&apos;unsafe-inline&apos;</code>.
                </li>
                <li>
                  Render it only in the server-rendered document (from{' '}
                  <code>@kvirn-ui/react/server</code> in a Server Component), and pass it the same{' '}
                  <code>theme</code> object as the provider.
                </li>
                <li>
                  It reads <code>localStorage</code> only, so don&apos;t render it with a custom
                  adapter.
                </li>
              </ul>
              <CodeBlock code={themeScriptCode} />
            </>
          ),
        },
        {
          id: 'announcements',
          label: 'Announcements and toasts',
          children: sectionLinks.announcements,
          content: (
            <>
              <Sub {...liveRegions} />
              <p>
                The outermost provider renders two empty, visually hidden live regions after its
                children, one polite and one assertive. Components and your own code reach them
                through <code>useAnnouncer().announce</code>. They are where a screen reader hears a
                change that moves no focus (WCAG 4.1.3), such as a result count, a rejected
                character or a finished upload.
              </p>
              <CodeBlock code={announce} />
              <ul>
                <li>
                  Nested providers use the outermost one&apos;s regions, so a page never has two
                  pairs and no message is read twice.
                </li>
                <li>
                  Without a provider, <code>announce</code> does nothing and a development warning
                  says so.
                </li>
                <li>
                  The regions have no <code>lang</code> of their own: they inherit the page&apos;s,
                  which is another reason to set <code>&lt;html lang&gt;</code>.
                </li>
              </ul>
              <p>
                See <Link href="/components/announcer">Announcer</Link> for politeness and
                throttling.
              </p>
              <Note kind="reminder">{messages.docs.note.announcerProvider}</Note>
              <Sub {...toasts} />
              <p>
                Every provider on a page shares one toast list and one region, which{' '}
                <code>useToast()</code> shows toasts in. The first provider that mounts renders it
                after its children, in the top layer, and its <code>toast</code> options are the
                ones used. The region exists only while a toast is shown.
              </p>
              <ul>
                <li>
                  <code>limit</code> is how many toasts show at once (default 10).
                </li>
                <li>
                  <code>autoDismiss</code> is whether they time out. The default is{' '}
                  <code>false</code>: nothing times out. A number is milliseconds, with no minimum.
                  Tie it to a setting the user can change (WCAG 2.2.1).
                </li>
              </ul>
              <CodeBlock code={toastOptions} />
              <p>
                A toast is a second channel for a result that is also shown in place. See{' '}
                <Link href="/components/toast">Toast</Link> for when not to use one.
              </p>
            </>
          ),
        },
        {
          id: 'api',
          label: 'API reference',
          children: sectionLinks.api,
          content: (
            <>
              <Sub {...imports} />
              <CodeBlock
                code={
                  "import { KvirnProvider, KvirnThemeScript, useLocale, useDateSettings, useFormat, useTheme } from '@kvirn-ui/react'"
                }
              />
              <p>
                <code>@kvirn-ui/react/server</code> has no <code>&apos;use client&apos;</code> and
                is safe in a Server Component:
              </p>
              <CodeBlock
                code={
                  "import { KvirnThemeScript, getLocaleProps, getMessages, createMessageFormat } from '@kvirn-ui/react/server'"
                }
              />
              <Sub {...apiProvider} />
              <p>
                Renders no element of its own, apart from the live regions of the outermost one.
              </p>
              <PropTable headingId={apiProvider.id} rows={providerRows} part="kvirn-provider" />
              <Sub {...apiHooks} />
              <p>
                Each hook reads the nearest provider. <code>useTheme</code> reads the one theme
                store of the page.
              </p>
              <PropTable headingId={apiHooks.id} rows={hookRows} part="hooks" />
              <Sub {...apiThemeScript} />
              <PropTable
                headingId={apiThemeScript.id}
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
