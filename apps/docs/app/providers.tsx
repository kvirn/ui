'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import type { ThemeOptions } from '@kvirn-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { SiteShell } from '../components/site-shell.tsx'

// Must match KvirnThemeScript's defaults in layout.tsx (both follow the device).
const theme: ThemeOptions = { defaultColorScheme: 'system', defaultContrast: 'system' }

/** The site dogfoods KvirnUI: the provider, Next.js links, and the shell built on Button and Link. */
export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <KvirnProvider locale="en" linkComponent={NextLink} theme={theme}>
      <SiteShell pathname={pathname}>{children}</SiteShell>
    </KvirnProvider>
  )
}
