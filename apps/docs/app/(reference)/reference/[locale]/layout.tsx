// Default theme, in @layer kv. The reference site loads no docs.css or gallery.css: it is what an
// adopter can build from theme.css and @kvirn-ui/* alone.
import '@kvirn-ui/theme/theme.css'
import '../../../../fonts/ibm-plex/ibm-plex.css'
import { KvirnThemeScript, getLocaleProps } from '@kvirn-ui/react/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  isReferenceLocale,
  referenceLocales,
  referenceMessages,
} from '../../../../messages/reference.ts'
import { theme } from '../../../(docs)/theme.ts'
import { ReferenceShell } from './reference-shell.tsx'

export const dynamicParams = false

export const generateStaticParams = () => referenceLocales.map((locale) => ({ locale }))

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    return {}
  }
  const text = referenceMessages[locale]
  return {
    title: { template: text.title({ page: '%s' }), default: text.siteName },
    description: text.description,
    robots: { index: false, follow: false },
  }
}

export default async function ReferenceRootLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const localeProps = getLocaleProps(locale)
  return (
    <html lang={localeProps.lang} dir={localeProps.dir} suppressHydrationWarning>
      <head>
        <KvirnThemeScript theme={theme} />
      </head>
      <body>
        <ReferenceShell locale={locale} theme={theme}>
          {children}
        </ReferenceShell>
      </body>
    </html>
  )
}
