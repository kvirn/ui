// Default theme (ADR-0013), in @layer kv, then the site's own unlayered CSS, which wins.
import '@kvirn-ui/theme/theme.css'
// Self-hosted IBM Plex Sans and Serif (ADR-0027): no request to any third party, at build
// time or at runtime.
import '../fonts/ibm-plex/ibm-plex.css'
import './docs.css'
import { KvirnThemeScript } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { Providers } from './providers.tsx'

export const metadata: Metadata = {
  title: messages.docs.meta.homeTitle,
  description: messages.docs.meta.description,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // KvirnThemeScript sets data-kv-color-scheme and data-kv-contrast before first paint.
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <KvirnThemeScript defaultColorScheme="system" defaultContrast="system" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
