'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import type { KvirnProviderProps } from '@kvirn-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { SiteShell } from '../components/site-shell.tsx'

/** The site dogfoods KvirnUI: the provider, Next.js links, and the shell built on Button and Link. */
export function AppKvirnProvider({
  children,
  ...props
}: Omit<KvirnProviderProps, 'messages' | 'linkComponent' | 'icons' | 'env'>) {
  const pathname = usePathname()
  return (
    <KvirnProvider {...props} linkComponent={NextLink}>
      <SiteShell pathname={pathname}>{children}</SiteShell>
    </KvirnProvider>
  )
}
