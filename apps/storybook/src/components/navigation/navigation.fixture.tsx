import { KvirnProvider, Link, Navigation } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
// Package-internal fixture, shared with link.test.tsx. It stands in for a router: not part of
// the public API.
import {
  MockRouterProvider,
  mockRouterLinkComponent,
  useMockPathname,
} from '../../../../../packages/react/src/link/link.fixture.tsx'

// Fixtures for Components/Navigation. Each exported function is one example, written to be read:
// the stories show its source as "Show code" (`showSource`). The names are fixture text from the
// resident's language, so they are plain strings here, where an app would take them from its
// translations.

const texts = {
  sv: {
    bar: 'Huvudmeny',
    start: 'Start',
    building: 'Bygga och bo',
    traffic: 'Trafik och resor',
    municipality: 'Om kommunen',
    sidebar: 'Handläggning',
    overview: 'Översikt',
    cases: 'Ärenden',
    permits: 'Bygglov',
    inProgress: 'Under handläggning',
    ready: 'Klara för beslut',
    customers: 'Kunder',
  },
  en: {
    bar: 'Main menu',
    start: 'Start',
    building: 'Building and living',
    traffic: 'Traffic and roads',
    municipality: 'About the municipality',
    sidebar: 'Case handling',
    overview: 'Overview',
    cases: 'Cases',
    permits: 'Building permits',
    inProgress: 'In progress',
    ready: 'Ready for decision',
    customers: 'Customers',
  },
}

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

/**
 * A staff tree four levels deep. The current page is a solid fill, and every ancestor of it is
 * the quiet fill in bold: the trail. Only the page has `aria-current`. The trail is found by the
 * theme, so there is nothing to mark on the ancestors.
 */
export function StaffNavigation() {
  return (
    <Navigation.Root label="Handläggning">
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#oversikt">Översikt</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#arenden">Ärenden</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#mina-arenden">Mina ärenden</Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#bygglov">Bygglov</Link.Root>
              <Navigation.List>
                <Navigation.Item>
                  <Link.Root href="#nya-ansokningar">Nya ansökningar</Link.Root>
                </Navigation.Item>
                <Navigation.Item>
                  <Link.Root href="#under-handlaggning" current="page">
                    Under handläggning
                  </Link.Root>
                  <Navigation.List>
                    <Navigation.Item>
                      <Link.Root href="#vantar-pa-komplettering">Väntar på komplettering</Link.Root>
                    </Navigation.Item>
                    <Navigation.Item>
                      <Link.Root href="#klara-for-beslut">Klara för beslut</Link.Root>
                    </Navigation.Item>
                  </Navigation.List>
                </Navigation.Item>
                <Navigation.Item>
                  <Link.Root href="#beslutade">Beslutade</Link.Root>
                </Navigation.Item>
              </Navigation.List>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#miljo-och-halsa">Miljö och hälsa</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#kunder">Kunder</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#rapporter">Rapporter</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}

/**
 * A bar of plain links for a page header: one class on the root, no prop. The links are still
 * plain Tab stops in DOM order. The page is in the bar, so its link has `current="page"`.
 */
export function HorizontalNavigation() {
  return (
    <Navigation.Root label="Huvudmeny" className="kv-navigation--horizontal">
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#bygga-och-bo" current="page">
            Bygga och bo
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#trafik-och-resor">Trafik och resor</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#uppleva-och-gora">Uppleva och göra</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#om-kommunen">Om kommunen</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}

/**
 * Groups you collapse are rendered with `hidden`, never unmounted: their links leave the Tab
 * sequence and the accessibility tree, and nothing remounts when your own toggle opens one. The
 * page, Bygglov, is inside the first collapsed group, so Bygga och bo, the deepest item shown,
 * carries `current`. A link inside a hidden group never does.
 */
export function CollapsedNavigation() {
  return (
    <Navigation.Root label="Huvudmeny">
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#bygga-och-bo" current>
            Bygga och bo
          </Link.Root>
          <Navigation.List hidden>
            <Navigation.Item>
              <Link.Root href="#bygglov">Bygglov</Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#bygga-om">Bygga om</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#trafik-och-resor">Trafik och resor</Link.Root>
          <Navigation.List hidden>
            <Navigation.Item>
              <Link.Root href="#parkering">Parkering</Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#kollektivtrafik">Kollektivtrafik</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#om-kommunen">Om kommunen</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}

/**
 * The page the reader is on, a permit case, is not a menu item. The deepest item shown, Bygglov,
 * carries `current`, which gives `aria-current="true"`: the navigation still has exactly one
 * current link, and the ancestor Bygga och bo is the trail.
 */
export function UnlistedPageNavigation() {
  return (
    <Navigation.Root label="Huvudmeny">
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#bygga-och-bo">Bygga och bo</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#bygglov" current>
                Bygglov
              </Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#bygga-om">Bygga om</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#om-oss">Om oss</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}

/**
 * A horizontal bar with long Finnish labels. An item is as wide as its label, up to the width of
 * the row, and a label wider than the row wraps inside its pill.
 */
export function FinnishHorizontalNavigation() {
  return (
    <Navigation.Root label="Päävalikko" lang="fi" className="kv-navigation--horizontal">
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#alku">Alku</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#rakentaminen">Rakentaminen ja asuminen</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#rakennuslupa" current="page">
            Rakennus- ja toimenpidelupahakemuksen liitteet
          </Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#liikenne">Liikenne ja kadut</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}

/**
 * Both orientations: a bar and a list, each named and each with exactly one current link. The
 * page is in the list, so only its link has `aria-current="page"`: the bar's section is the
 * deepest item shown in the bar, so it takes `current` (`aria-current="true"`), and a screen
 * reader never hears "current page" twice. The list has the trail: every ancestor of its page is
 * the quiet fill in bold.
 */
export function NavigationOrientations({ locale }: { locale: 'sv' | 'en' }) {
  const text = texts[locale]
  return (
    <>
      <Navigation.Root label={text.bar} className="kv-navigation--horizontal">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start">{text.start}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#building" current>
              {text.building}
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#traffic">{text.traffic}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#municipality">{text.municipality}</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
      <Navigation.Root label={text.sidebar}>
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#overview">{text.overview}</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#cases">{text.cases}</Link.Root>
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#permits">{text.permits}</Link.Root>
                <Navigation.List>
                  <Navigation.Item>
                    <Link.Root href="#in-progress" current="page">
                      {text.inProgress}
                    </Link.Root>
                  </Navigation.Item>
                  <Navigation.Item>
                    <Link.Root href="#ready">{text.ready}</Link.Root>
                  </Navigation.Item>
                </Navigation.List>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#customers">{text.customers}</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </>
  )
}
