import { KvirnProvider, Link, Navigation } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
// Package-internal fixture, shared with link.test.tsx. It stands in for a router: not part of
// the public API.
import {
  MockRouterProvider,
  mockRouterLinkComponent,
  useMockPathname,
} from '../../../../../packages/react/src/link/link.fixture.tsx'

// Fixtures for Components/Link. The RouterLink story's "Show code" prints both functions
// (`showSource`): how an app registers its router's link, and the Links that then use it.

/**
 * The root of an app with a client-side router. Register the router's link once, on the
 * provider, and every Link renders it. `mockRouterLinkComponent` stands in for your router's own
 * link (such as `NextLink`), and `MockRouterProvider` for its provider. In a TypeScript app,
 * augment `Register` so `LinkProps` follow the router's link:
 * `declare module '@kvirn-ui/react' { interface Register { linkComponent: typeof NextLink } }`.
 */
export function AppRoot({ children }: { children: ReactNode }) {
  return (
    <KvirnProvider linkComponent={mockRouterLinkComponent}>
      <MockRouterProvider initialPathname="/start">{children}</MockRouterProvider>
    </KvirnProvider>
  )
}

/**
 * Links in a navigation. Each is a native `<a href>` that the router's link renders. `current`
 * comes from your router's pathname (here the mock's), so the current page is marked with
 * `aria-current="page"`.
 */
export function RoutedNavigation() {
  const pathname = useMockPathname()
  return (
    <>
      <Navigation.Root label="Huvudmeny">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="/start" current={pathname === '/start' ? 'page' : false}>
              Start
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="/ansok" current={pathname === '/ansok' ? 'page' : false}>
              Ansök
            </Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
      <p>Nuvarande sida: {pathname}</p>
    </>
  )
}
