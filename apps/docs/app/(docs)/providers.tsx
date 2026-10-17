'use client'
import { KvirnProvider } from '@kvirn-ui/react'
import type { KvirnProviderProps } from '@kvirn-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useState } from 'react'
import { SiteShell } from '../../components/site-shell.tsx'
import { icons } from '../../lib/icons.ts'

type AutoDismiss = false | number

const AutoDismissContext = createContext<readonly [AutoDismiss, (value: AutoDismiss) => void]>([
  false,
  () => {},
])

/** Docs only: the Toast page's example drives the site's toast timer through this. */
export function useDocsAutoDismiss() {
  return useContext(AutoDismissContext)
}

/** The site dogfoods KvirnUI: the provider, Next.js links, and the shell built on Button and Link. */
export function AppKvirnProvider({
  children,
  ...props
}: Omit<KvirnProviderProps, 'messages' | 'linkComponent' | 'icons' | 'env' | 'toast'>) {
  const pathname = usePathname()
  const [autoDismiss, setAutoDismiss] = useState<AutoDismiss>(false)
  return (
    <KvirnProvider {...props} icons={icons} linkComponent={NextLink} toast={{ autoDismiss }}>
      <AutoDismissContext value={[autoDismiss, setAutoDismiss]}>
        <SiteShell pathname={pathname}>{children}</SiteShell>
      </AutoDismissContext>
    </KvirnProvider>
  )
}
