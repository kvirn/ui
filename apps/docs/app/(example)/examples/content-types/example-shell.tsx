'use client'
import { KvirnProvider, useRouteFocus } from '@kvirn-ui/react'
import type { ThemeOptions } from '@kvirn-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

function RouteFocus({ children }: { children: ReactNode }) {
  useRouteFocus({ key: usePathname() })
  return children
}

/** The example pages' own provider: no docs shell, so the content type's header is the page's only banner. */
export function ExampleShell({ theme, children }: { theme: ThemeOptions; children: ReactNode }) {
  return (
    <KvirnProvider locale="en" timeZone="UTC" theme={theme} linkComponent={NextLink}>
      <RouteFocus>{children}</RouteFocus>
    </KvirnProvider>
  )
}
