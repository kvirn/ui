// Default theme, in @layer kv, then the site's own unlayered CSS, which wins.
import '@kvirn-ui/theme/theme.css'
// Self-hosted IBM Plex Sans and Serif: no request to any third party, at build
// time or at runtime.
import '../fonts/ibm-plex/ibm-plex.css'
import './docs.css'
import { KvirnThemeScript, getLocaleProps } from '@kvirn-ui/react/server'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { AppKvirnProvider } from './providers.tsx'
import { theme } from './theme.ts'

const locale = 'en'
const localeProps = getLocaleProps(locale)

export const metadata: Metadata = {
  title: messages.docs.meta.homeTitle,
  description: messages.docs.meta.description,
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reading headers() makes every page dynamic, so only the opt-in CSP build (proxy.ts) does it.
  const nonce =
    process.env.DOCS_CSP_NONCE === '1' ? ((await headers()).get('x-nonce') ?? undefined) : undefined

  return (
    // KvirnThemeScript sets data-kv-color-scheme, data-kv-contrast and data-kv-motion before first paint.
    <html lang={localeProps.lang} dir={localeProps.dir} suppressHydrationWarning>
      <head>
        <KvirnThemeScript nonce={nonce} theme={theme} />
      </head>
      <body>
        <AppKvirnProvider locale={locale} timeZone="UTC" theme={theme}>
          {children}
        </AppKvirnProvider>
      </body>
    </html>
  )
}
