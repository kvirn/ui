import { Heading, Link } from '@kvirn-ui/react'
import { apiHookPart } from './api-ids.ts'
import { AnchoredHeading } from './anchored-heading.tsx'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  providerAttributes,
  providerRows,
  scriptRows,
  themeRows,
  toastOptionRows,
  useDateSettingsHook,
  useFormatHook,
  useLocaleHook,
  useThemeHook,
} from '../content/kvirn-provider.api.ts'
import { AnotherLanguage } from '../examples/kvirn-provider/another-language.tsx'
import { DefaultKvirnProvider } from '../examples/kvirn-provider/default.tsx'
import { ThemeSwitcher } from '../examples/kvirn-provider/theme-switcher.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type KvirnProviderExampleSources = Record<
  'default' | 'another-language' | 'theme-switcher',
  string
>

const nextProviders = `// app/kvirn-provider.tsx
'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import type { KvirnProviderProps } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import NextLink from 'next/link'
import { icons } from './icons' // a 'use client' module that calls defineIcons for the extra icon names you want

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
import { router } from './router' // the result of createRouter

export function App() {
  return (
    <KvirnProvider locale="fi-FI" messages={fi} timeZone="Europe/Helsinki" linkComponent={Link}>
      <RouterProvider router={router} />
    </KvirnProvider>
  )
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

const serverImport = `import { KvirnThemeScript, getLocaleProps, getMessages, createMessageFormat } from '@kvirn-ui/react/server'`

const parts: ApiPart[] = [
  {
    name: 'KvirnProvider',
    renders: (
      <>
        no element of its own. The outermost provider adds two visually hidden live regions after
        its children, and a toast region while a toast shows. Nested providers inherit everything
        they don’t set.
      </>
    ),
    props: providerRows,
    attributes: providerAttributes,
  },
  {
    name: 'ThemeOptions',
    renders: (
      <>
        nothing: it is the object you pass as the <code>theme</code> prop. The default theme has
        three independent settings: colour scheme, contrast and motion. Each follows the device
        until the user chooses. Under forced colours the device’s own palette always wins. A chosen
        preference is a small piece of data in the browser, so describe it in your privacy notice.
        The CSS side is on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: themeRows,
  },
  {
    name: 'KvirnToastOptions',
    renders: (
      <>
        nothing: it is the object you pass as the <code>toast</code> prop. All providers on a page
        share one toast list and one toast region. See <Link href="/components/toast">Toast</Link>{' '}
        for when to use a toast.
      </>
    ),
    props: toastOptionRows,
  },
  {
    name: 'KvirnThemeScript',
    renders: (
      <>
        a small <code>&lt;script&gt;</code> for the document’s <code>&lt;head&gt;</code>. It reads
        the stored preference and the device settings, and sets the <code>data-kv-*</code>{' '}
        attributes on <code>&lt;html&gt;</code> before the first paint, so there is no flash of the
        wrong theme. Render it only in the server-rendered document, from{' '}
        <code>@kvirn-ui/react/server</code> in a Server Component. It reads{' '}
        <code>localStorage</code> only, so don’t use it with a custom storage adapter. See{' '}
        <Link href="/foundation/rendering#first-paint">No flash of the wrong theme</Link>.
      </>
    ),
    props: scriptRows,
  },
]

export function KvirnProviderPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: KvirnProviderExampleSources
}) {
  return (
    <ComponentPage
      title="KvirnProvider"
      lead="Gives every KvirnUI component its language, text, text direction, date settings and router link. It also owns the page’s theme preference and the live regions that announcements use."
      whenToUse={
        <ul>
          <li>
            Put one KvirnProvider at the root of your app. It is optional, but it is where
            announcements come from, so every real service needs it.
          </li>
          <li>
            Without it, components use English, left-to-right text, UTC as the time zone, weeks that
            start on Monday and a plain <code>&lt;a&gt;</code>. The theme follows the device.
          </li>
          <li>
            Add a nested provider for a part of the page in another language. A nested provider
            inherits everything it doesn’t set.
          </li>
          <li>
            Don’t nest providers to change the theme or to add live regions: there is one theme and
            one pair of live regions per page. To change one component’s text, pass{' '}
            <code>messages</code> to that component instead.
          </li>
          <li>
            For what runs on the server and what runs in the browser, see{' '}
            <Link href="/foundation/rendering">Rendering: server and client</Link>. For texts and
            number and date formats, see <Link href="/foundation/locales">Locales and strings</Link>
            .
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultKvirnProvider />
          </ExampleFrame>
          <AnchoredHeading as="h3" id="next-js">
            Set up in Next.js (App Router)
          </AnchoredHeading>
          <p>
            <code>layout.tsx</code> is a Server Component: it runs only on the server.{' '}
            <code>KvirnProvider</code> is a client component: it runs in the browser. Props that
            cross from one to the other must be plain data. Some can be passed straight from the
            layout, and some need a small client file.
          </p>
          <AnchoredHeading as="h4" id="next-js-from-layout">
            Passed from the layout
          </AnchoredHeading>
          <p>Strings, numbers and plain objects:</p>
          <ul>
            <li>
              <code>locale</code>, <code>dir</code>, <code>country</code>, <code>timeZone</code>,{' '}
              <code>weekStart</code>
            </li>
            <li>
              the <code>theme</code> defaults, <code>toast</code>, <code>iconDefaults</code>
            </li>
            <li>
              <code>children</code> and the script’s <code>nonce</code>
            </li>
          </ul>
          <AnchoredHeading as="h4" id="next-js-client-file">
            Needs a client file
          </AnchoredHeading>
          <ul>
            <li>
              <code>messages</code>: catalogs hold functions, which can’t cross.
            </li>
            <li>
              <code>linkComponent</code>: import <code>next/link</code> in a client module.
            </li>
            <li>
              <code>icons</code>: a registry made by <code>defineIcons</code>, which comes from the
              client entry. It can hold components, so it lives in a client module.
            </li>
            <li>
              <code>theme.storage</code>: an adapter is an object of functions.
            </li>
            <li>
              <code>env</code>: a window and a document.
            </li>
          </ul>
          <AnchoredHeading as="h4" id="next-js-wrapper">
            The client wrapper
          </AnchoredHeading>
          <p>
            Put those props in one <code>&apos;use client&apos;</code> wrapper, and let the layout
            pass the rest.
          </p>
          <CodeBlock code={nextProviders} />
          <AnchoredHeading as="h4" id="next-js-theme">
            The theme object
          </AnchoredHeading>
          <p>One object for the script and the provider, so the defaults are written once.</p>
          <CodeBlock code={nextTheme} />
          <AnchoredHeading as="h4" id="next-js-layout">
            The layout
          </AnchoredHeading>
          <p>
            The layout imports <code>KvirnThemeScript</code> and <code>getLocaleProps</code> from{' '}
            <code>@kvirn-ui/react/server</code>, the entry that is safe in a Server Component.
          </p>
          <CodeBlock code={nextLayout} />
          <ul>
            <li>
              <code>getLocaleProps(locale)</code> gives <code>lang</code> and <code>dir</code> for{' '}
              <code>&lt;html&gt;</code>, the pair the provider works out for the same locale. The
              provider renders no element of its own, so it can’t set the language of the page
              (3.1.1 Language of Page, level A).
            </li>
            <li>
              Set <code>timeZone</code> and <code>weekStart</code>, so the server and the browser
              show the same date.
            </li>
            <li>
              <code>suppressHydrationWarning</code> on <code>&lt;html&gt;</code> is on purpose:{' '}
              <code>KvirnThemeScript</code> adds <code>data-kv-color-scheme</code>,{' '}
              <code>data-kv-contrast</code> and <code>data-kv-motion</code> before React hydrates.
              It only affects <code>&lt;html&gt;</code>’s own attributes.
            </li>
          </ul>
          <AnchoredHeading as="h3" id="tanstack-router">
            Set up with TanStack Router
          </AnchoredHeading>
          <p>
            TanStack Router’s <code>Link</code> renders an <code>&lt;a&gt;</code> and takes a ref,
            so it works as <code>linkComponent</code>.
          </p>
          <CodeBlock code={tanstack} />
          <p>
            In a client-only app the provider applies the theme when it mounts, so the default theme
            can flash for a moment. If you render on the server, render{' '}
            <code>KvirnThemeScript</code> in the document’s <code>&lt;head&gt;</code>. Other
            frameworks are covered in{' '}
            <Link href="/foundation/rendering#other-frameworks">Rendering</Link>.
          </p>
          <AnchoredHeading as="h3" id="typed-registration">
            Typed registration
          </AnchoredHeading>
          <p>
            Register your link component and your icons once to get their props typed, including
            typed routes. Without it, <code>linkComponent</code> only accepts{' '}
            <code>&apos;a&apos;</code>. The <code>icons</code> key is the type of the registry you
            pass to <code>icons</code>, so a misspelt <code>Icon name</code> is a type error. Both
            keys are optional.
          </p>
          <CodeBlock code={register} />
        </>
      }
      useCases={
        <>
          <UseCase
            id="another-language"
            title="A page part in another language"
            why={
              <>
                A page in one language has a notice in another, such as a Finnish notice (“Your
                application has been received. We will process it within three weeks.”) on an
                English page. Wrap the part in a nested provider with its locale and its catalog,
                and spread <code>localeProps</code> on the element that starts the part. A screen
                reader then reads the part in the right language.
              </>
            }
            code={sources['another-language']}
            propsUsed={[
              { part: 'KvirnProvider', prop: 'locale' },
              { part: 'KvirnProvider', prop: 'messages' },
            ]}
            note={
              <Note kind="reminder">
                Pass the catalog with the locale. Without it, the part’s texts stay in the parent’s
                language while <code>lang</code> says otherwise, and a development warning names
                both (3.1.2 Language of Parts, level AA).
              </Note>
            }
          >
            <AnotherLanguage />
          </UseCase>
          <UseCase
            id="theme-switcher"
            title="Let visitors choose the theme"
            why={
              <>
                Some visitors need dark mode or high contrast to read. The provider follows the
                device until a visitor chooses, keeps the choice in this browser, and{' '}
                <code>useTheme</code> reads and changes it. Build the controls from labelled radio
                groups, one group per setting. When <code>isForcedColors</code> is true, say that
                the device’s own colours are in use. This example changes the theme of the whole
                site, like Display settings at the top of the page. KvirnUI also has a ready-made{' '}
                <code>DisplaySettings</code> component for the same job.
              </>
            }
            code={sources['theme-switcher']}
            propsUsed={[
              {
                part: apiHookPart('useTheme', 'result'),
                label: 'useTheme (result)',
                prop: 'colorScheme',
              },
              {
                part: apiHookPart('useTheme', 'result'),
                label: 'useTheme (result)',
                prop: 'contrast',
              },
              {
                part: apiHookPart('useTheme', 'result'),
                label: 'useTheme (result)',
                prop: 'isForcedColors',
              },
              {
                part: apiHookPart('useTheme', 'result'),
                label: 'useTheme (result)',
                prop: 'selectColorScheme',
              },
              {
                part: apiHookPart('useTheme', 'result'),
                label: 'useTheme (result)',
                prop: 'selectContrast',
              },
            ]}
            note={
              <Note kind="reminder">
                A theme change moves no focus and announces nothing, so the checked option is the
                feedback. Don’t put the result in a live region (3.2.2 On Input, level A).
              </Note>
            }
          >
            <ThemeSwitcher />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Set <code>lang</code> and <code>dir</code> on <code>&lt;html&gt;</code> with{' '}
                <code>getLocaleProps</code>. The provider can’t: it renders no element to carry them
                (3.1.1 Language of Page, level A).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <>
          <ApiBlock
            importLine="import { KvirnProvider, KvirnThemeScript, useLocale, useDateSettings, useFormat, useTheme } from '@kvirn-ui/react'"
            parts={parts}
            hooks={[useLocaleHook, useDateSettingsHook, useFormatHook, useThemeHook]}
          />
          <Heading as="h3" id="api-server-entry">
            The server entry
          </Heading>
          <p>
            <code>@kvirn-ui/react/server</code> has no <code>&apos;use client&apos;</code> and is
            safe in a Server Component.
          </p>
          <CodeBlock code={serverImport} />
        </>
      }
    />
  )
}
