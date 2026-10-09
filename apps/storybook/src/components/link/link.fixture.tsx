import { KvirnProvider, Link } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
// Package-internal fixture, shared with link.test.tsx. It stands in for a router: not part of
// the public API.
import {
  MockRouterProvider,
  mockRouterLinkComponent,
  useMockPathname,
} from '../../../../../packages/react/src/link/link.fixture.tsx'

// Fixtures for Components/Link. The RoutedLinks story's "Show code" prints AppRoot and
// RoutedLinkList (`showSource`): how an app registers its router's link, and the Links that then
// use it. The same router with a list of links in a navigation is Components/Navigation's
// RouterLink.

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
 * Links that the router's link renders. Each is a native `<a href>`. `current` comes from your
 * router's pathname (here the mock's), so the current page is marked with `aria-current="page"`.
 */
export function RoutedLinkList() {
  const pathname = useMockPathname()
  return (
    <>
      <ul>
        <li>
          <Link.Root href="/start" current={pathname === '/start' ? 'page' : false}>
            Start
          </Link.Root>
        </li>
        <li>
          <Link.Root href="/ansok" current={pathname === '/ansok' ? 'page' : false}>
            Ansök
          </Link.Root>
        </li>
      </ul>
      <p>Nuvarande sida: {pathname}</p>
    </>
  )
}

/**
 * With a router registered, a plain `as="a"` bypasses it for one link, such as a download
 * that the router must not handle. Your own `rel` tokens join `noopener noreferrer` on a link that
 * opens a new tab, and `Link.NewTabNotice` takes `as` like a tag part.
 */
export function RouterAndPlainLinks() {
  return (
    <KvirnProvider linkComponent={mockRouterLinkComponent}>
      <MockRouterProvider initialPathname="/start">
        <ul>
          <li>
            <Link.Root href="/ansok">Ansök</Link.Root>
          </li>
          <li>
            <Link.Root href="/blankett.pdf" download as="a">
              Blankett (PDF)
            </Link.Root>
          </li>
          <li>
            <Link.Root href="https://www.digg.se/" target="_blank" rel="author">
              Digg <Link.NewTabNotice as="small" />
            </Link.Root>
          </li>
        </ul>
      </MockRouterProvider>
    </KvirnProvider>
  )
}
