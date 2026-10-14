// Default theme, in @layer kv. The example pages load no docs.css or gallery.css and no docs shell:
// each is one whole page, so it has one banner, one main and one contentinfo.
import '@kvirn-ui/theme/theme.css'
import '../../../../fonts/ibm-plex/ibm-plex.css'
import { KvirnThemeScript, getLocaleProps } from '@kvirn-ui/react/server'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { messages } from '../../../../messages/en.ts'
import { theme } from '../../../(docs)/theme.ts'
import { ExampleShell } from './example-shell.tsx'

const text = messages.docs.contentTypes.example

export const metadata: Metadata = {
  title: { template: text.title({ page: '%s' }), default: text.siteName },
  robots: { index: false, follow: false },
}

export default function ExampleRootLayout({ children }: { children: ReactNode }) {
  const localeProps = getLocaleProps('en')
  return (
    <html lang={localeProps.lang} dir={localeProps.dir} suppressHydrationWarning>
      <head>
        <KvirnThemeScript theme={theme} />
      </head>
      <body>
        <ExampleShell theme={theme}>{children}</ExampleShell>
      </body>
    </html>
  )
}
